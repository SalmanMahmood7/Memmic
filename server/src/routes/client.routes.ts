import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../middleware/errorHandler";
import { requireRoles } from "../middleware/requireRoles";
import { ApiError } from "../core/apiError";
import { hashPassword } from "../core/security";
import { sseManager } from "../services/sse";
import { sendNotificationEmail } from "../services/email";
import { seedPortalDashboard as runSeed } from "../services/portalSeed";
import {
  ContactSubmissionRequestSchema,
  GeneralContactSubmissionRequestSchema,
} from "../schemas/contact.schema";
import {
  PortalActionMoveSchema,
  PortalMessageCreateSchema,
  PortalProfileUpdateSchema,
} from "../schemas/portal.schema";
import {
  serializeEnquiry,
  serializePortalAction,
  serializePortalAlert,
  serializePortalDashboardOut,
  serializePortalEnquiry,
  serializePortalMessage,
  serializePortalProfile,
  serviceEntry,
} from "../schemas/serializers";
import { ClientMessageStatus } from "@prisma/client";

const router = Router();

const PORTAL_ROLES = ["evaluation_client", "investment_client", "marketplace_client", "management_client"];
const PORTAL_TYPES = ["evaluation", "management", "marketplace", "investment"] as const;

router.get(
  "/portal/me",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const roleName = currentUser.role.name;
    const portalType = roleName.replace("_client", "");

    let enquiryOut = null;
    if (currentUser.clientMessageId) {
      const enquiry = await prisma.clientMessage.findUnique({ where: { id: currentUser.clientMessageId } });
      if (enquiry) {
        const category = await prisma.enquiryCategory.findUnique({ where: { id: enquiry.categoryId } });
        enquiryOut = serializePortalEnquiry(enquiry, category, portalType);
      }
    }

    res.json(serializePortalProfile(currentUser, portalType, enquiryOut));
  })
);

router.post(
  "/general-contact-us",
  asyncHandler(async (req, res) => {
    const payload = GeneralContactSubmissionRequestSchema.parse(req.body);

    const contact = await prisma.generalContactUs.create({
      data: { fullName: payload.full_name, email: payload.email, brief: payload.brief },
    });

    await sendNotificationEmail(contact.fullName, contact.email, contact.brief);

    sseManager.broadcast({
      type: "new_general_message",
      message: {
        id: contact.id,
        full_name: contact.fullName,
        email: contact.email,
        brief: contact.brief,
        is_read: contact.isRead,
        created_at: contact.createdAt.toISOString(),
      },
    });

    res.json({ message: "Your message has been successfully submitted" });
  })
);

router.post(
  "/enquiry",
  asyncHandler(async (req, res) => {
    const payload = ContactSubmissionRequestSchema.parse(req.body);

    const category = await prisma.enquiryCategory.findFirst({
      where: { id: payload.category_id, isActive: 1 },
    });
    if (!category) throw new ApiError(400, "Invalid or inactive category");

    const enquiry = await prisma.clientMessage.create({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        categoryId: payload.category_id,
        brief: payload.brief,
        status: ClientMessageStatus.pending,
      },
    });

    sseManager.broadcast({
      type: "new_client_message",
      message: {
        id: enquiry.id,
        full_name: enquiry.fullName,
        email: enquiry.email,
        category: category.name,
        brief: enquiry.brief,
        status: enquiry.status,
        created_at: enquiry.createdAt.toISOString(),
      },
    });

    res.json(serializeEnquiry(enquiry));
  })
);

router.post(
  "/contact-us",
  asyncHandler(async (req, res) => {
    const payload = ContactSubmissionRequestSchema.parse(req.body);

    const category = await prisma.enquiryCategory.findFirst({
      where: { id: payload.category_id, isActive: 1 },
    });
    if (!category) throw new ApiError(400, "Invalid or inactive category");

    const contact = await prisma.contactUs.create({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        categoryId: payload.category_id,
        whatyouneed: category.name,
        brief: payload.brief,
      },
    });

    sseManager.broadcast({
      type: "new_message",
      message: {
        id: contact.id,
        full_name: contact.fullName,
        email: contact.email,
        whatyouneed: category.name,
        brief: contact.brief,
        is_read: contact.isRead,
        created_at: contact.createdAt.toISOString(),
      },
    });

    res.json({ message: "Your message has been successfully submitted" });
  })
);

// ===================== Executive Portal Dashboard =====================

async function getPortalDashboard(currentUser: { clientMessageId: string | null }) {
  if (!currentUser.clientMessageId) {
    throw new ApiError(404, "No linked enquiry found for this account");
  }
  const dashboard = await prisma.portalDashboard.findUnique({
    where: { clientMessageId: currentUser.clientMessageId },
  });
  if (!dashboard) throw new ApiError(404, "Portal dashboard not available yet");
  return dashboard;
}

async function ownedDashboardIds(currentUser: { id: string; clientMessageId: string | null }): Promise<string[]> {
  const allowedIds = new Set<string>();
  if (currentUser.clientMessageId) allowedIds.add(currentUser.clientMessageId);

  const links = await prisma.userService.findMany({ where: { userId: currentUser.id } });
  links.forEach((l) => allowedIds.add(l.clientMessageId));

  const owned = await prisma.clientMessage.findMany({
    where: { clientUserId: currentUser.id, status: ClientMessageStatus.approved },
  });
  owned.forEach((e) => allowedIds.add(e.id));

  if (allowedIds.size === 0) return [];
  const dashboards = await prisma.portalDashboard.findMany({
    where: { clientMessageId: { in: Array.from(allowedIds) } },
  });
  return dashboards.map((d) => d.id);
}

router.get(
  "/portal/services",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const primaryId = currentUser.clientMessageId;

    const enquiryIds = new Set<string>();
    const serviceLinks = await prisma.userService.findMany({ where: { userId: currentUser.id } });
    serviceLinks.forEach((s) => enquiryIds.add(s.clientMessageId));
    if (primaryId) enquiryIds.add(primaryId);

    const submitted = await prisma.clientMessage.findMany({ where: { clientUserId: currentUser.id } });
    submitted.forEach((e) => enquiryIds.add(e.id));

    const services: unknown[] = [];
    if (enquiryIds.size > 0) {
      const enquiries = await prisma.clientMessage.findMany({
        where: { id: { in: Array.from(enquiryIds) } },
        include: { category: true },
      });
      const dashboards = await prisma.portalDashboard.findMany({
        where: { clientMessageId: { in: Array.from(enquiryIds) } },
      });
      const dashboardByEnquiry = new Map(dashboards.map((d) => [d.clientMessageId, d]));

      for (const enquiry of enquiries) {
        const dashboard = dashboardByEnquiry.get(enquiry.id);
        services.push(
          serviceEntry(enquiry, enquiry.category, dashboard, enquiry.id === primaryId, {
            rejection_reason: enquiry.rejectionReason,
          })
        );
      }
    }

    services.sort((a: any, b: any) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return String(a.portal_type).localeCompare(String(b.portal_type));
    });
    res.json(services);
  })
);

router.post(
  "/portal/enquiry",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = ContactSubmissionRequestSchema.parse(req.body);

    const category = await prisma.enquiryCategory.findFirst({
      where: { id: payload.category_id, isActive: 1 },
    });
    if (!category) throw new ApiError(400, "Invalid or inactive category");

    const enquiry = await prisma.clientMessage.create({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        categoryId: payload.category_id,
        brief: payload.brief,
        status: ClientMessageStatus.pending,
        clientUserId: currentUser.id,
      },
    });

    sseManager.broadcast({
      type: "new_client_message",
      message: {
        id: enquiry.id,
        full_name: enquiry.fullName,
        email: enquiry.email,
        category: category.name,
        brief: enquiry.brief,
        status: enquiry.status,
        created_at: enquiry.createdAt.toISOString(),
      },
    });

    res.json(serializeEnquiry(enquiry));
  })
);

router.get(
  "/portal/dashboard",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const portalType = (req.query.portal_type as string | undefined) ?? null;

    let targetEnquiryId = currentUser.clientMessageId;

    if (portalType) {
      if (!PORTAL_TYPES.includes(portalType as (typeof PORTAL_TYPES)[number])) {
        throw new ApiError(400, "Invalid portal_type");
      }

      const link = await prisma.userService.findFirst({
        where: { userId: currentUser.id, clientMessage: { category: { formType: portalType } } },
        include: { clientMessage: true },
      });

      if (link) {
        targetEnquiryId = link.clientMessage.id;
      } else {
        const owned = await prisma.clientMessage.findFirst({
          where: {
            clientUserId: currentUser.id,
            status: ClientMessageStatus.approved,
            category: { formType: portalType },
          },
          include: { category: true },
          orderBy: { createdAt: "desc" },
        });
        if (owned) {
          targetEnquiryId = owned.id;
          const existingLink = await prisma.userService.findUnique({ where: { clientMessageId: owned.id } });
          if (!existingLink) {
            await prisma.userService.create({
              data: { userId: currentUser.id, clientMessageId: owned.id, portalType },
            });
          }
        } else {
          throw new ApiError(403, "You do not have access to this service");
        }
      }
    }

    if (!targetEnquiryId) throw new ApiError(404, "No linked enquiry found for this account");

    let dashboard = await prisma.portalDashboard.findUnique({ where: { clientMessageId: targetEnquiryId } });
    if (!dashboard) {
      dashboard = await runSeed(prisma, targetEnquiryId, portalType ?? "evaluation");
    }

    const alerts = await prisma.portalAlert.findMany({
      where: { dashboardId: dashboard.id },
      orderBy: { createdAt: "desc" },
    });
    const actions = await prisma.portalAction.findMany({
      where: { dashboardId: dashboard.id },
      orderBy: { sortOrder: "asc" },
    });

    res.json(serializePortalDashboardOut(dashboard, alerts, actions));
  })
);

router.patch(
  "/portal/alerts/:alertId/read",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const dashIds = await ownedDashboardIds(currentUser);

    const alert = await prisma.portalAlert.findFirst({
      where: { id: req.params.alertId, dashboardId: { in: dashIds } },
    });
    if (!alert) throw new ApiError(404, "Alert not found");

    const updated = await prisma.portalAlert.update({ where: { id: alert.id }, data: { isRead: true } });
    res.json(serializePortalAlert(updated));
  })
);

router.patch(
  "/portal/actions/:actionId/move",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = PortalActionMoveSchema.parse(req.body);
    const dashIds = await ownedDashboardIds(currentUser);

    const action = await prisma.portalAction.findFirst({
      where: { id: req.params.actionId, dashboardId: { in: dashIds } },
    });
    if (!action) throw new ApiError(404, "Action not found");

    if (!["todo", "in_progress", "review", "done"].includes(payload.column)) {
      throw new ApiError(400, "Invalid column");
    }

    const updated = await prisma.portalAction.update({
      where: { id: action.id },
      data: { column: payload.column },
    });
    res.json(serializePortalAction(updated));
  })
);

router.post(
  "/portal/dashboard/seed",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    if (!currentUser.clientMessageId) throw new ApiError(404, "No linked enquiry found for this account");

    const enquiry = await prisma.clientMessage.findUnique({ where: { id: currentUser.clientMessageId } });
    if (!enquiry) throw new ApiError(404, "Linked enquiry not found");

    const category = await prisma.enquiryCategory.findUnique({ where: { id: enquiry.categoryId } });
    const portalType = category ? category.formType : currentUser.role.name.replace("_client", "");

    const dashboard = await runSeed(prisma, enquiry.id, portalType);
    res.json({ message: "Demo dashboard seeded", dashboard_id: dashboard.id });
  })
);

router.get(
  "/portal/messages",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const dashboard = await getPortalDashboard(req.currentUser!);
    const messages = await prisma.portalMessage.findMany({
      where: { dashboardId: dashboard.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(messages.map(serializePortalMessage));
  })
);

router.post(
  "/portal/messages",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const payload = PortalMessageCreateSchema.parse(req.body);
    const dashboard = await getPortalDashboard(req.currentUser!);

    const message = await prisma.portalMessage.create({
      data: {
        dashboardId: dashboard.id,
        sender: "client",
        subject: payload.subject.trim(),
        body: payload.body.trim(),
        isRead: true,
      },
    });

    res.status(201).json(serializePortalMessage(message));
  })
);

router.patch(
  "/portal/messages/:messageId/read",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const dashboard = await getPortalDashboard(req.currentUser!);
    const message = await prisma.portalMessage.findFirst({
      where: { id: req.params.messageId, dashboardId: dashboard.id },
    });
    if (!message) throw new ApiError(404, "Message not found");

    const updated = await prisma.portalMessage.update({ where: { id: message.id }, data: { isRead: true } });
    res.json(serializePortalMessage(updated));
  })
);

router.patch(
  "/portal/me",
  requireRoles(...PORTAL_ROLES),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = PortalProfileUpdateSchema.parse(req.body);

    const data: { fullName?: string; hashedPassword?: string } = {};

    if (payload.full_name !== undefined && payload.full_name !== null) {
      const trimmed = payload.full_name.trim();
      if (trimmed.length < 2) throw new ApiError(400, "Full name must be at least 2 characters");
      data.fullName = trimmed;
    }

    if (payload.password !== undefined && payload.password !== null) {
      if (payload.password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");
      data.hashedPassword = await hashPassword(payload.password);
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data,
      include: { role: true },
    });

    res.json({
      full_name: updated.fullName,
      email: updated.email,
      role: updated.role.name,
    });
  })
);

export default router;
