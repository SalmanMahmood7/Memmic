import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../middleware/errorHandler";
import { requireRoles } from "../middleware/requireRoles";
import { ApiError } from "../core/apiError";
import { hashPassword, decodeToken } from "../core/security";
import { generateCredentials } from "../core/credentials";
import { sseManager } from "../services/sse";
import { seedPortalDashboard as runSeed } from "../services/portalSeed";
import { sendCredentialsEmail, sendWelcomeEmail } from "../services/email";
import { logger } from "../logger";
import { intParam, boolParam, stringParam, parseCookies } from "../utils/query";
import { ClientMessageStatus, Prisma } from "@prisma/client";

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

import {
  ClientMessageApproveSchema,
  ClientMessageCredentialsUpdateSchema,
  ClientMessageRejectSchema,
} from "../schemas/clientMessage.schema";
import { ClientAccountCreateSchema } from "../schemas/clientAccount.schema";
import {
  EnquiryCategoryCreateSchema,
  EnquiryCategoryUpdateSchema,
} from "../schemas/enquiryCategory.schema";
import { SystemLogCreateSchema } from "../schemas/systemLog.schema";
import {
  AdminPortalMessageCreateSchema,
  AdminDashboardHealthUpdateSchema,
  AdminProfileUpdateSchema,
  PortalStageUpsertListSchema,
  PortalStageUpdateSchema,
  PortalAlertCreateSchema,
  PortalAlertUpdateSchema,
  PortalActionCreateSchema,
  PortalActionUpdateSchema,
} from "../schemas/portal.schema";

import {
  serializeContactMessage,
  serializeGeneralMessage,
  serializeEnquiry,
  serializeEnquiryCategory,
  serializeClientAccount,
  serializeUserMe,
  serializeSystemLog,
  serializePortalAlert,
  serializePortalAction,
  serializePortalMessage,
  NotificationItem,
  serviceEntry,
} from "../schemas/serializers";

const router = Router();

const CLIENT_PORTAL_ROLES: Record<string, string> = {
  evaluation: "evaluation_client",
  investment: "investment_client",
  marketplace: "marketplace_client",
  management: "management_client",
};

const CLIENT_PORTAL_TYPES: Record<string, string> = {
  evaluation_client: "evaluation",
  investment_client: "investment",
  marketplace_client: "marketplace",
  management_client: "management",
};

function portalTypeForRole(roleName: string): string {
  return CLIENT_PORTAL_TYPES[roleName] ?? roleName.replace("_client", "");
}

// ============ Profile ============

router.get(
  "/me",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    res.json(serializeUserMe(req.currentUser!));
  })
);

router.patch(
  "/me",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = AdminProfileUpdateSchema.parse(req.body ?? {});

    if (!payload.full_name && !payload.email && !payload.password) {
      throw new ApiError(400, "Provide at least one field to update");
    }

    if (payload.email && payload.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const clash = await prisma.user.findFirst({
        where: { email: { equals: payload.email, mode: "insensitive" }, id: { not: currentUser.id } },
      });
      if (clash) throw new ApiError(409, "That email is already in use by another account");
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(payload.full_name ? { fullName: payload.full_name.trim() } : {}),
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.password ? { hashedPassword: await hashPassword(payload.password) } : {}),
      },
      include: { role: true },
    });

    res.json(serializeUserMe(updated));
  })
);

// ============ Legacy contact messages (ContactUs) ============

router.get(
  "/client/messages",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const limit = intParam(req, "limit", 50, { max: 200 });
    const offset = intParam(req, "offset", 0, { min: 0 });
    const isRead = boolParam(req, "is_read");
    const search = stringParam(req, "search");

    const where: Record<string, unknown> = {};
    if (isRead !== undefined) where.isRead = isRead;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { whatyouneed: { contains: search, mode: "insensitive" } },
        { brief: { contains: search, mode: "insensitive" } },
      ];
    }

    const messages = await prisma.contactUs.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
    res.json(messages.map(serializeContactMessage));
  })
);

router.get(
  "/client/general-messages",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const limit = intParam(req, "limit", 50, { max: 200 });
    const offset = intParam(req, "offset", 0, { min: 0 });
    const isRead = boolParam(req, "is_read");
    const search = stringParam(req, "search");

    const where: Record<string, unknown> = {};
    if (isRead !== undefined) where.isRead = isRead;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { brief: { contains: search, mode: "insensitive" } },
      ];
    }

    const messages = await prisma.generalContactUs.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
    res.json(messages.map(serializeGeneralMessage));
  })
);

router.get(
  "/client/messages/unread-count",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const count = await prisma.contactUs.count({ where: { isRead: false } });
    res.json({ unread_count: count });
  })
);

// ============ Notifications ============

router.get(
  "/notifications",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const limit = intParam(req, "limit", 20, { max: 50 });

    const [generalMsgs, clientMsgs, enquiries] = await Promise.all([
      prisma.generalContactUs.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
      prisma.contactUs.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
      prisma.clientMessage.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    ]);

    const items: NotificationItem[] = [];
    for (const m of generalMsgs) {
      items.push({
        id: m.id,
        type: "general",
        full_name: m.fullName,
        email: m.email,
        brief: m.brief,
        is_unread: !m.isRead,
        created_at: m.createdAt,
      });
    }
    for (const m of clientMsgs) {
      items.push({
        id: m.id,
        type: "message",
        full_name: m.fullName,
        email: m.email,
        brief: m.brief,
        is_unread: !m.isRead,
        category: m.whatyouneed,
        created_at: m.createdAt,
      });
    }
    for (const e of enquiries) {
      items.push({
        id: e.id,
        type: "enquiry",
        full_name: e.fullName,
        email: e.email,
        brief: e.brief,
        is_unread: !e.isRead,
        status: e.status,
        created_at: e.createdAt,
      });
    }

    items.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    const limited = items.slice(0, limit);

    const [unreadGeneral, unreadClient, unreadEnquiries] = await Promise.all([
      prisma.generalContactUs.count({ where: { isRead: false } }),
      prisma.contactUs.count({ where: { isRead: false } }),
      prisma.clientMessage.count({ where: { isRead: false } }),
    ]);

    res.json({
      items: limited,
      total_unread: unreadGeneral + unreadClient + unreadEnquiries,
    });
  })
);

router.get(
  "/notifications/unread-count",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const [unreadGeneral, unreadClient, unreadEnquiries] = await Promise.all([
      prisma.generalContactUs.count({ where: { isRead: false } }),
      prisma.contactUs.count({ where: { isRead: false } }),
      prisma.clientMessage.count({ where: { isRead: false } }),
    ]);
    res.json({ unread_count: unreadGeneral + unreadClient + unreadEnquiries });
  })
);

router.patch(
  "/notifications/:notificationId/read",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const id = req.params.notificationId;

    const general = await prisma.generalContactUs.findUnique({ where: { id } });
    if (general) {
      const updated = await prisma.generalContactUs.update({ where: { id }, data: { isRead: true } });
      res.json({
        id: updated.id,
        type: "general",
        full_name: updated.fullName,
        email: updated.email,
        brief: updated.brief,
        is_unread: !updated.isRead,
        created_at: updated.createdAt,
      });
      return;
    }

    const message = await prisma.contactUs.findUnique({ where: { id } });
    if (message) {
      const updated = await prisma.contactUs.update({ where: { id }, data: { isRead: true } });
      res.json({
        id: updated.id,
        type: "message",
        full_name: updated.fullName,
        email: updated.email,
        brief: updated.brief,
        is_unread: !updated.isRead,
        category: updated.whatyouneed,
        created_at: updated.createdAt,
      });
      return;
    }

    const enquiry = await prisma.clientMessage.findUnique({ where: { id } });
    if (enquiry) {
      const updated = await prisma.clientMessage.update({ where: { id }, data: { isRead: true } });
      res.json({
        id: updated.id,
        type: "enquiry",
        full_name: updated.fullName,
        email: updated.email,
        brief: updated.brief,
        is_unread: !updated.isRead,
        status: updated.status,
        created_at: updated.createdAt,
      });
      return;
    }

    throw new ApiError(404, "Notification not found");
  })
);

router.patch(
  "/client/general-messages/:messageId/read",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.generalContactUs.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Something went wrong, message could not be found");
    const updated = await prisma.generalContactUs.update({ where: { id: message.id }, data: { isRead: true } });
    res.json(serializeGeneralMessage(updated));
  })
);

router.patch(
  "/client-messages/:messageId/read",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.clientMessage.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Enquiry not found");
    const updated = await prisma.clientMessage.update({ where: { id: message.id }, data: { isRead: true } });
    res.json(serializeEnquiry(updated));
  })
);

// ============ SSE stream ============

router.get(
  "/client/messages/stream",
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string | undefined;
    let currentUser = null as Awaited<ReturnType<typeof prisma.user.findUnique>> | null;

    logger.info(`SSE stream request - token param: ${token ? token.slice(0, 20) : "None"}...`);

    if (token) {
      const decoded = decodeToken(token);
      logger.info(`Token decoded: ${JSON.stringify(decoded)}`);
      if (decoded && decoded.type === "access" && decoded.sub) {
        currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
      }
    }

    if (!currentUser) {
      const authHeader = req.headers.authorization;
      const cookies = parseCookies(req.headers.cookie);
      let cookieToken: string | null = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        cookieToken = authHeader.split(" ")[1];
      }
      if (!cookieToken) {
        cookieToken = cookies["memmic_access_token"] ?? null;
      }
      if (cookieToken) {
        const decoded = decodeToken(cookieToken);
        if (decoded && decoded.type === "access" && decoded.sub) {
          currentUser = await prisma.user.findUnique({ where: { id: decoded.sub } });
        }
      }
    }

    if (!currentUser) {
      res.writeHead(401, { "Content-Type": "text/event-stream" });
      res.write(`data: ${JSON.stringify({ type: "error", message: "Unauthorized" })}\n\n`);
      res.end();
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(`data: ${JSON.stringify({ type: "connected", message: "Connected to message stream" })}\n\n`);

    sseManager.connect(res);
    req.on("close", () => sseManager.disconnect(res));
  })
);

router.get(
  "/client/messages/:messageId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactUs.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Message not found");
    res.json(serializeContactMessage(message));
  })
);

router.patch(
  "/client/messages/:messageId/read",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactUs.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Something went wrong, message could not found");
    const updated = await prisma.contactUs.update({ where: { id: message.id }, data: { isRead: true } });
    res.json(serializeContactMessage(updated));
  })
);

router.delete(
  "/client/messages/:messageId",
  requireRoles("Admin", "super_admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.contactUs.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Message not found to delete");
    await prisma.contactUs.delete({ where: { id: message.id } });
    res.json({ message: "Message deleted successfully" });
  })
);

// ============ System logs ============

router.get(
  "/system-logs",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const limit = intParam(req, "limit", 100, { max: 500 });
    const offset = intParam(req, "offset", 0, { min: 0 });
    const level = stringParam(req, "level");
    const source = stringParam(req, "source");

    const where: Record<string, unknown> = {};
    if (level) where.level = level.toUpperCase();
    if (source) where.source = source;

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
    res.json(logs.map(serializeSystemLog));
  })
);

router.get(
  "/system-logs/stats",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const [total, errorCount, warningCount, infoCount, sources] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({ where: { level: "ERROR" } }),
      prisma.systemLog.count({ where: { level: "WARNING" } }),
      prisma.systemLog.count({ where: { level: "INFO" } }),
      prisma.systemLog.findMany({ select: { source: true } }),
    ]);

    const sourceCounts: Record<string, number> = {};
    for (const { source } of sources) {
      sourceCounts[source] = (sourceCounts[source] ?? 0) + 1;
    }

    res.json({
      total,
      by_level: { ERROR: errorCount, WARNING: warningCount, INFO: infoCount },
      by_source: sourceCounts,
    });
  })
);

router.post(
  "/system-logs",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = SystemLogCreateSchema.parse(req.body);
    const log = await prisma.systemLog.create({
      data: {
        level: payload.level,
        message: payload.message,
        source: payload.source,
        userId: payload.user_id ?? undefined,
        ipAddress: payload.ip_address ?? undefined,
        userAgent: payload.user_agent ?? undefined,
        logMetadata: payload.metadata ?? undefined,
      },
    });
    res.json(serializeSystemLog(log));
  })
);

// ============ Enquiry categories ============

// NOTE: preserved from the original — this endpoint has no auth guard even
// though it lives under /admin, matching Backend/app/api/v1/admin.py exactly.
router.get(
  "/enquiry-categories/user",
  asyncHandler(async (req, res) => {
    const formType = stringParam(req, "form_type");
    const isActiveRaw = req.query.is_active;
    const where: Record<string, unknown> = {};
    if (formType) where.formType = formType;
    if (isActiveRaw !== undefined && isActiveRaw !== "") where.isActive = Number(isActiveRaw);

    const categories = await prisma.enquiryCategory.findMany({ where, orderBy: { formType: "asc" } });
    res.json(categories.map(serializeEnquiryCategory));
  })
);

router.get(
  "/enquiry-categories",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const formType = stringParam(req, "form_type");
    const isActiveRaw = req.query.is_active;
    const where: Record<string, unknown> = {};
    if (formType) where.formType = formType;
    if (isActiveRaw !== undefined && isActiveRaw !== "") where.isActive = Number(isActiveRaw);

    const categories = await prisma.enquiryCategory.findMany({ where, orderBy: { formType: "asc" } });
    res.json(categories.map(serializeEnquiryCategory));
  })
);

router.get(
  "/enquiry-categories/:categoryId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const category = await prisma.enquiryCategory.findUnique({ where: { id: req.params.categoryId } });
    if (!category) throw new ApiError(404, "Category not found");
    res.json(serializeEnquiryCategory(category));
  })
);

router.post(
  "/enquiry-categories",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = EnquiryCategoryCreateSchema.parse(req.body);
    const category = await prisma.enquiryCategory.create({
      data: {
        formType: payload.form_type,
        name: payload.name,
        description: payload.description ?? undefined,
        isActive: payload.is_active,
      },
    });
    res.status(201).json(serializeEnquiryCategory(category));
  })
);

router.patch(
  "/enquiry-categories/:categoryId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = EnquiryCategoryUpdateSchema.parse(req.body);
    const category = await prisma.enquiryCategory.findUnique({ where: { id: req.params.categoryId } });
    if (!category) throw new ApiError(404, "Category not found");

    const data: Record<string, unknown> = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.is_active !== undefined) data.isActive = payload.is_active;

    const updated = await prisma.enquiryCategory.update({ where: { id: category.id }, data });
    res.json(serializeEnquiryCategory(updated));
  })
);

router.delete(
  "/enquiry-categories/:categoryId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const category = await prisma.enquiryCategory.findUnique({ where: { id: req.params.categoryId } });
    if (!category) throw new ApiError(404, "Category not found");

    const messageCount = await prisma.contactUs.count({ where: { categoryId: category.id } });
    if (messageCount > 0) {
      throw new ApiError(400, `Cannot delete category: ${messageCount} messages reference it. Deactivate instead.`);
    }

    await prisma.enquiryCategory.delete({ where: { id: category.id } });
    res.json({ message: "Category deleted successfully" });
  })
);

// ============ Client message (enquiry) management ============

router.get(
  "/client-messages",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const status = stringParam(req, "status");
    const categoryId = stringParam(req, "category_id");
    const limit = intParam(req, "limit", 50, { max: 200 });
    const offset = intParam(req, "offset", 0, { min: 0 });

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const messages = await prisma.clientMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
    res.json(await enrichEnquiries(messages));
  })
);

router.get(
  "/client-messages/:messageId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.clientMessage.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Message not found");
    const [enriched] = await enrichEnquiries([message]);
    res.json(enriched);
  })
);

/** Attach client_account_email (the portal account created from this enquiry, if any). */
async function enrichEnquiries(messages: Awaited<ReturnType<typeof prisma.clientMessage.findMany>>) {
  if (messages.length === 0) return [];
  const accounts = await prisma.user.findMany({
    where: { clientMessageId: { in: messages.map((m) => m.id) } },
  });
  const emailByEnquiry = new Map(accounts.map((a) => [a.clientMessageId as string, a.email]));
  return messages.map((m) => {
    const withEmail = { ...m, clientAccountEmail: emailByEnquiry.get(m.id) ?? null };
    return serializeEnquiry(withEmail);
  });
}

async function notifyClientPortal(user: { id: string; clientMessageId: string | null }, subject: string, body: string) {
  if (!user.clientMessageId) return;
  const dashboard = await prisma.portalDashboard.findUnique({ where: { clientMessageId: user.clientMessageId } });
  if (!dashboard) return;
  await prisma.portalMessage.create({
    data: { dashboardId: dashboard.id, sender: "firm", subject, body, isRead: false },
  });
}

router.post(
  "/client-messages/:messageId/approve",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = ClientMessageApproveSchema.parse(req.body ?? {});

    let message = await prisma.clientMessage.findUnique({
      where: { id: req.params.messageId },
      include: { category: true },
    });
    if (!message) throw new ApiError(404, "Message not found");
    if (message.status !== ClientMessageStatus.pending) {
      throw new ApiError(400, `Message is already ${message.status}`);
    }

    message = await prisma.clientMessage.update({
      where: { id: message.id },
      data: { status: ClientMessageStatus.approved, approvedAt: new Date(), approvedBy: currentUser.id },
      include: { category: true },
    });

    const portalType = message.category.formType.toLowerCase();

    let existingUser = message.clientUserId
      ? await prisma.user.findUnique({ where: { id: message.clientUserId } })
      : null;
    if (!existingUser) {
      existingUser = await prisma.user.findFirst({
        where: {
          linkedEnquiry: { email: { equals: message.email, mode: "insensitive" } },
        },
      });
    }

    if (existingUser) {
      // Existing portal client applying for another service: link the new service
      // WITHOUT generating new credentials.
      const link = await prisma.userService.findUnique({ where: { clientMessageId: message.id } });
      if (!link) {
        await prisma.userService.create({
          data: { userId: existingUser.id, clientMessageId: message.id, portalType },
        });
      }
    } else if (payload.send_credentials) {
      // Brand new client: generate credentials and create their account.
      const { email, password } = generateCredentials();

      const roleName = CLIENT_PORTAL_ROLES[portalType];
      if (!roleName) {
        throw new ApiError(
          400,
          `Cannot generate credentials: enquiry category form type '${portalType}' has no client portal role`
        );
      }
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) throw new ApiError(500, "Client portal role is not configured");

      const existingByEmail = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
      const existingByEnquiry = await prisma.user.findFirst({ where: { clientMessageId: message.id } });

      if (!existingByEmail && !existingByEnquiry) {
        const newUser = await prisma.user.create({
          data: {
            fullName: message.fullName,
            email,
            hashedPassword: await hashPassword(password),
            roleId: role.id,
            isActive: true,
            clientMessageId: message.id,
          },
        });
        await prisma.userService.create({
          data: { userId: newUser.id, clientMessageId: message.id, portalType },
        });
        existingUser = newUser;
      }

      message = await prisma.clientMessage.update({
        where: { id: message.id },
        data: { generatedEmail: email, generatedPassword: password },
        include: { category: true },
      });

      // Credentials are generated but intentionally not emailed yet — the admin
      // reviews/edits them via PATCH .../credentials, then explicitly triggers
      // POST .../send-credentials once they're ready to hand off to the client.
    }

    // Seed the per-service dashboard whenever a service was linked.
    const linked = await prisma.userService.findFirst({ where: { clientMessageId: message.id } });
    if (linked) {
      await runSeed(prisma, message.id, portalType);
    }

    // Notify the client inside their portal inbox.
    if (existingUser && existingUser.clientMessageId) {
      await notifyClientPortal(
        existingUser,
        `Your ${message.category.name} service application was approved`,
        `Congratulations! Your application for the ${message.category.name} service has been approved. ` +
          "The service is now linked to your account and available in your client portal."
      );
    }

    const [enriched] = await enrichEnquiries([message]);
    res.json(enriched);
  })
);

router.patch(
  "/client-messages/:messageId/credentials",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = ClientMessageCredentialsUpdateSchema.parse(req.body ?? {});

    const message = await prisma.clientMessage.findUnique({
      where: { id: req.params.messageId },
      include: { category: true },
    });
    if (!message) throw new ApiError(404, "Message not found");
    if (!message.generatedEmail || !message.generatedPassword) {
      throw new ApiError(400, "This enquiry has no generated credentials to edit yet");
    }
    if (!payload.email && !payload.password) {
      throw new ApiError(400, "Provide an email and/or password to update");
    }

    const linkedUser = await prisma.user.findFirst({
      where: { clientMessageId: message.id },
    });

    if (payload.email && payload.email.toLowerCase() !== message.generatedEmail.toLowerCase()) {
      const clash = await prisma.user.findFirst({
        where: {
          email: { equals: payload.email, mode: "insensitive" },
          ...(linkedUser ? { id: { not: linkedUser.id } } : {}),
        },
      });
      if (clash) throw new ApiError(409, "That email is already in use by another account");
    }

    const updated = await prisma.clientMessage.update({
      where: { id: message.id },
      data: {
        generatedEmail: payload.email ?? message.generatedEmail,
        generatedPassword: payload.password ?? message.generatedPassword,
      },
      include: { category: true },
    });

    if (linkedUser) {
      await prisma.user.update({
        where: { id: linkedUser.id },
        data: {
          ...(payload.email ? { email: payload.email } : {}),
          ...(payload.password ? { hashedPassword: await hashPassword(payload.password) } : {}),
        },
      });
    }

    const [enriched] = await enrichEnquiries([updated]);
    res.json(enriched);
  })
);

router.post(
  "/client-messages/:messageId/send-credentials",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.clientMessage.findUnique({
      where: { id: req.params.messageId },
      include: { category: true },
    });
    if (!message) throw new ApiError(404, "Message not found");
    if (!message.generatedEmail || !message.generatedPassword) {
      throw new ApiError(400, "This enquiry has no generated credentials to send yet");
    }

    await sendCredentialsEmail(message.email, message.generatedEmail, message.generatedPassword, message.fullName);

    const updated = await prisma.clientMessage.update({
      where: { id: message.id },
      data: { credentialsSentAt: new Date() },
      include: { category: true },
    });

    const [enriched] = await enrichEnquiries([updated]);
    res.json(enriched);
  })
);

router.post(
  "/client-messages/:messageId/reject",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const currentUser = req.currentUser!;
    const payload = ClientMessageRejectSchema.parse(req.body);

    let message = await prisma.clientMessage.findUnique({
      where: { id: req.params.messageId },
      include: { category: true },
    });
    if (!message) throw new ApiError(404, "Message not found");
    if (message.status !== ClientMessageStatus.pending) {
      throw new ApiError(400, `Message is already ${message.status}`);
    }

    message = await prisma.clientMessage.update({
      where: { id: message.id },
      data: {
        status: ClientMessageStatus.rejected,
        rejectionReason: payload.rejection_reason,
        approvedAt: new Date(),
        approvedBy: currentUser.id,
      },
      include: { category: true },
    });

    let targetUser = message.clientUserId
      ? await prisma.user.findUnique({ where: { id: message.clientUserId } })
      : null;
    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { linkedEnquiry: { email: { equals: message.email, mode: "insensitive" } } },
      });
    }
    if (targetUser && targetUser.clientMessageId) {
      await notifyClientPortal(
        targetUser,
        `Your ${message.category.name} service application was not approved`,
        `Thank you for your interest in the ${message.category.name} service. ` +
          "Unfortunately your application was not approved at this time.\n\n" +
          `Reason: ${payload.rejection_reason}\n\n` +
          "Please feel free to reach out if you have any questions."
      );
    }

    const [enriched] = await enrichEnquiries([message]);
    res.json(enriched);
  })
);

router.get(
  "/client-messages/stats/summary",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.clientMessage.count(),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.pending } }),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.approved } }),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.rejected } }),
    ]);

    const rows = await prisma.clientMessage.findMany({ include: { category: true } });
    const byCategory: Record<string, { pending: number; approved: number; rejected: number }> = {};
    for (const row of rows) {
      const key = `${row.category.name} (${row.category.formType})`;
      if (!byCategory[key]) byCategory[key] = { pending: 0, approved: 0, rejected: 0 };
      byCategory[key][row.status as "pending" | "approved" | "rejected"] += 1;
    }

    res.json({ total, pending, approved, rejected, by_category: byCategory });
  })
);

// ============ Portal Messages (admin visibility) ============

router.get(
  "/portal/messages",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const limit = intParam(req, "limit", 100, { max: 500 });
    const offset = intParam(req, "offset", 0, { min: 0 });

    const messages = await prisma.portalMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: { dashboard: { include: { clientMessage: true } } },
    });

    res.json(
      messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        subject: m.subject,
        body: m.body,
        is_read: m.isRead,
        client_name: m.dashboard.clientMessage.fullName,
        client_email: m.dashboard.clientMessage.email,
        created_at: m.createdAt.toISOString(),
      }))
    );
  })
);

router.patch(
  "/portal/messages/:messageId/read",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const message = await prisma.portalMessage.findUnique({ where: { id: req.params.messageId } });
    if (!message) throw new ApiError(404, "Message not found");
    const updated = await prisma.portalMessage.update({ where: { id: message.id }, data: { isRead: true } });
    res.json(serializePortalMessage(updated));
  })
);

router.post(
  "/portal/messages",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = AdminPortalMessageCreateSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: payload.client_id }, include: { role: true } });
    if (!user) throw new ApiError(404, "Client account not found");
    if (!user.clientMessageId) throw new ApiError(400, "Client account has no linked enquiry");

    let dashboard = await prisma.portalDashboard.findUnique({ where: { clientMessageId: user.clientMessageId } });
    if (!dashboard) {
      const portalType = portalTypeForRole(user.role.name);
      dashboard = await runSeed(prisma, user.clientMessageId, portalType);
    }

    const message = await prisma.portalMessage.create({
      data: {
        dashboardId: dashboard.id,
        sender: "firm",
        subject: payload.subject.trim(),
        body: payload.body.trim(),
        isRead: false,
      },
    });

    sseManager.broadcast({
      type: "portal_message",
      client_id: user.id,
      client_email: user.email,
      message: serializePortalMessage(message),
    });

    res.status(201).json({
      id: message.id,
      sender: message.sender,
      subject: message.subject,
      body: message.body,
      is_read: message.isRead,
      client_name: user.fullName,
      client_email: user.email,
      created_at: message.createdAt.toISOString(),
    });
  })
);

// ============ Admin Dashboard Management (client portal sync) ============

async function resolveClientDashboard(clientId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientId }, include: { role: true } });
  if (!user) throw new ApiError(404, "Client account not found");
  if (!user.clientMessageId) throw new ApiError(400, "Client account has no linked enquiry");

  let dashboard = await prisma.portalDashboard.findUnique({ where: { clientMessageId: user.clientMessageId } });
  if (!dashboard) {
    const portalType = portalTypeForRole(user.role.name);
    dashboard = await runSeed(prisma, user.clientMessageId, portalType);
  }
  return { user, dashboard };
}

router.get(
  "/portal/dashboards",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const portalType = stringParam(req, "portal_type");
    const search = stringParam(req, "search");
    const limit = intParam(req, "limit", 100, { max: 500 });
    const offset = intParam(req, "offset", 0, { min: 0 });

    const roleNames = Object.keys(CLIENT_PORTAL_TYPES);
    const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } });
    const roleIds = roles.map((r) => r.id);

    const where: Record<string, unknown> = { roleId: { in: roleIds } };
    if (portalType) {
      const targetRole = CLIENT_PORTAL_ROLES[portalType];
      const role = targetRole ? roles.find((r) => r.name === targetRole) : undefined;
      if (role) where.roleId = role.id;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: { ...where, clientMessageId: { not: null } },
      include: { role: true },
      skip: offset,
      take: limit,
    });

    const dashboards = await prisma.portalDashboard.findMany({
      where: { clientMessageId: { in: users.map((u) => u.clientMessageId as string) } },
    });
    const dashboardByEnquiry = new Map(dashboards.map((d) => [d.clientMessageId, d]));

    const rows = users
      .map((user) => ({ user, dashboard: dashboardByEnquiry.get(user.clientMessageId as string) }))
      .filter((r) => r.dashboard)
      .sort((a, b) => (b.dashboard!.updatedAt.getTime() - a.dashboard!.updatedAt.getTime()));

    res.json(
      rows.map(({ user, dashboard }) => ({
        client_id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: user.role.name,
        portal_type: portalTypeForRole(user.role.name),
        is_active: user.isActive,
        health_score: dashboard!.healthScore,
        health_components: dashboard!.healthComponents ?? {},
        updated_at: dashboard!.updatedAt ? dashboard!.updatedAt.toISOString() : null,
      }))
    );
  })
);

router.get(
  "/portal/dashboards/:clientId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const { user, dashboard } = await resolveClientDashboard(req.params.clientId);

    const [alerts, actions, messages] = await Promise.all([
      prisma.portalAlert.findMany({ where: { dashboardId: dashboard.id }, orderBy: { createdAt: "desc" } }),
      prisma.portalAction.findMany({ where: { dashboardId: dashboard.id }, orderBy: { sortOrder: "asc" } }),
      prisma.portalMessage.findMany({ where: { dashboardId: dashboard.id }, orderBy: { createdAt: "desc" } }),
    ]);

    res.json({
      client: {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: user.role.name,
        portal_type: portalTypeForRole(user.role.name),
        is_active: user.isActive,
      },
      health: { score: dashboard.healthScore, components: dashboard.healthComponents ?? {} },
      timeline: dashboard.timeline ?? [],
      alerts: alerts.map(serializePortalAlert),
      actions: actions.map(serializePortalAction),
      messages: messages.map(serializePortalMessage),
      evaluation: dashboard.evaluationData ?? {},
      management: dashboard.managementData ?? {},
      marketplace: dashboard.marketplaceData ?? {},
      investment: dashboard.investmentData ?? {},
    });
  })
);

router.patch(
  "/portal/dashboards/:clientId/health",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = AdminDashboardHealthUpdateSchema.parse(req.body);
    const { user, dashboard } = await resolveClientDashboard(req.params.clientId);

    const updated = await prisma.portalDashboard.update({
      where: { id: dashboard.id },
      data: {
        healthScore: payload.score,
        ...(payload.components !== undefined && payload.components !== null
          ? { healthComponents: toJson(payload.components) }
          : {}),
      },
    });

    res.json({
      client_id: user.id,
      health_score: updated.healthScore,
      health_components: updated.healthComponents ?? {},
    });
  })
);

router.post(
  "/portal/dashboards/:clientId/seed",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const { user, dashboard } = await resolveClientDashboard(req.params.clientId);

    const enquiry = await prisma.clientMessage.findUnique({ where: { id: dashboard.clientMessageId } });
    const category = enquiry ? await prisma.enquiryCategory.findUnique({ where: { id: enquiry.categoryId } }) : null;
    const portalType = category ? category.formType : portalTypeForRole(user.role.name);

    await runSeed(prisma, dashboard.clientMessageId, portalType);
    res.json({ message: "Demo dashboard reseeded", client_id: user.id });
  })
);

// ============ Admin: Dashboard content management ============

router.put(
  "/portal/dashboards/:clientId/timeline",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalStageUpsertListSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const updated = await prisma.portalDashboard.update({
      where: { id: dashboard.id },
      data: { timeline: toJson(payload) },
    });
    res.json({ timeline: updated.timeline ?? [] });
  })
);

router.patch(
  "/portal/dashboards/:clientId/timeline/:stageKey",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalStageUpdateSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const timeline = (Array.isArray(dashboard.timeline) ? dashboard.timeline : []) as Array<Record<string, unknown>>;
    const target = timeline.find((s) => s.key === req.params.stageKey);
    if (!target) throw new ApiError(404, "Timeline stage not found");

    if (payload.label !== undefined && payload.label !== null) target.label = payload.label;
    if (payload.status !== undefined && payload.status !== null) target.status = payload.status;
    if (payload.date !== undefined && payload.date !== null) target.date = payload.date;

    const updated = await prisma.portalDashboard.update({
      where: { id: dashboard.id },
      data: { timeline: toJson(timeline) },
    });
    res.json({ timeline: updated.timeline ?? [] });
  })
);

router.post(
  "/portal/dashboards/:clientId/alerts",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalAlertCreateSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const alert = await prisma.portalAlert.create({
      data: {
        dashboardId: dashboard.id,
        severity: payload.severity,
        title: payload.title,
        message: payload.message,
        isRead: false,
      },
    });
    res.status(201).json(serializePortalAlert(alert));
  })
);

router.patch(
  "/portal/dashboards/:clientId/alerts/:alertId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalAlertUpdateSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const alert = await prisma.portalAlert.findFirst({
      where: { id: req.params.alertId, dashboardId: dashboard.id },
    });
    if (!alert) throw new ApiError(404, "Alert not found");

    const data: Record<string, unknown> = {};
    if (payload.severity !== undefined && payload.severity !== null) data.severity = payload.severity;
    if (payload.title !== undefined && payload.title !== null) data.title = payload.title;
    if (payload.message !== undefined && payload.message !== null) data.message = payload.message;

    const updated = await prisma.portalAlert.update({ where: { id: alert.id }, data });
    res.json(serializePortalAlert(updated));
  })
);

router.delete(
  "/portal/dashboards/:clientId/alerts/:alertId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const { dashboard } = await resolveClientDashboard(req.params.clientId);
    const alert = await prisma.portalAlert.findFirst({
      where: { id: req.params.alertId, dashboardId: dashboard.id },
    });
    if (!alert) throw new ApiError(404, "Alert not found");
    await prisma.portalAlert.delete({ where: { id: alert.id } });
    res.json({ message: "Alert deleted", alert_id: alert.id });
  })
);

router.post(
  "/portal/dashboards/:clientId/actions",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalActionCreateSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const maxOrder = await prisma.portalAction.aggregate({
      where: { dashboardId: dashboard.id },
      _max: { sortOrder: true },
    });

    const action = await prisma.portalAction.create({
      data: {
        dashboardId: dashboard.id,
        title: payload.title,
        assignee: payload.assignee,
        column: payload.column,
        priority: payload.priority,
        dueDate: payload.due_date ?? undefined,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
    res.status(201).json(serializePortalAction(action));
  })
);

router.patch(
  "/portal/dashboards/:clientId/actions/:actionId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = PortalActionUpdateSchema.parse(req.body);
    const { dashboard } = await resolveClientDashboard(req.params.clientId);

    const action = await prisma.portalAction.findFirst({
      where: { id: req.params.actionId, dashboardId: dashboard.id },
    });
    if (!action) throw new ApiError(404, "Action not found");

    const data: Record<string, unknown> = {};
    if (payload.title !== undefined && payload.title !== null) data.title = payload.title;
    if (payload.assignee !== undefined && payload.assignee !== null) data.assignee = payload.assignee;
    if (payload.column !== undefined && payload.column !== null) data.column = payload.column;
    if (payload.priority !== undefined && payload.priority !== null) data.priority = payload.priority;
    if (payload.due_date !== undefined && payload.due_date !== null) data.dueDate = payload.due_date;

    const updated = await prisma.portalAction.update({ where: { id: action.id }, data });
    res.json(serializePortalAction(updated));
  })
);

router.delete(
  "/portal/dashboards/:clientId/actions/:actionId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const { dashboard } = await resolveClientDashboard(req.params.clientId);
    const action = await prisma.portalAction.findFirst({
      where: { id: req.params.actionId, dashboardId: dashboard.id },
    });
    if (!action) throw new ApiError(404, "Action not found");
    await prisma.portalAction.delete({ where: { id: action.id } });
    res.json({ message: "Action deleted", action_id: action.id });
  })
);

// ============================================================
// Client Account Management (Portal Accounts)
// ============================================================

router.get(
  "/clients",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const portalType = stringParam(req, "portal_type");
    const isActive = boolParam(req, "is_active");
    const search = stringParam(req, "search");
    const limit = intParam(req, "limit", 50, { max: 200 });
    const offset = intParam(req, "offset", 0, { min: 0 });

    const roleNames = Object.keys(CLIENT_PORTAL_TYPES);
    const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } });
    let roleIds = roles.map((r) => r.id);

    if (portalType) {
      const targetRole = CLIENT_PORTAL_ROLES[portalType];
      const role = targetRole ? roles.find((r) => r.name === targetRole) : undefined;
      if (role) roleIds = [role.id];
    }

    const where: Record<string, unknown> = { roleId: { in: roleIds } };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
    res.json(users.map(serializeClientAccount));
  })
);

router.get(
  "/dashboard/overview",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const roleNames = Object.keys(CLIENT_PORTAL_TYPES);
    const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } });
    const roleIds = roles.map((r) => r.id);

    const [totalClients, activeClients, blockedClients] = await Promise.all([
      prisma.user.count({ where: { roleId: { in: roleIds } } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, isActive: true } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, isActive: false } }),
    ]);

    const [totalEnquiries, pendingEnquiries, approvedEnquiries, rejectedEnquiries] = await Promise.all([
      prisma.clientMessage.count(),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.pending } }),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.approved } }),
      prisma.clientMessage.count({ where: { status: ClientMessageStatus.rejected } }),
    ]);

    const byPortal: Record<string, { clients: number; services: number; avg_health: number }> = {};
    for (const portalType of ["evaluation", "investment", "marketplace", "management"]) {
      const targetRole = CLIENT_PORTAL_ROLES[portalType];
      const role = roles.find((r) => r.name === targetRole);
      const clientCount = role ? await prisma.user.count({ where: { roleId: role.id } }) : 0;
      const serviceCount = await prisma.userService.count({ where: { portalType } });

      const services = await prisma.userService.findMany({ where: { portalType } });
      let avgHealth = 0;
      if (services.length > 0) {
        const dashboards = await prisma.portalDashboard.findMany({
          where: { clientMessageId: { in: services.map((s) => s.clientMessageId) } },
        });
        avgHealth =
          dashboards.length > 0
            ? dashboards.reduce((sum, d) => sum + d.healthScore, 0) / dashboards.length
            : 0;
      }

      byPortal[portalType] = {
        clients: clientCount,
        services: serviceCount,
        avg_health: Math.round(avgHealth * 10) / 10,
      };
    }

    const [recentEnquiries, recentMessages, recentLogs] = await Promise.all([
      prisma.clientMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.portalMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { dashboard: { include: { clientMessage: true } } },
      }),
      prisma.systemLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    interface ActivityItem {
      type: string;
      title: string;
      detail: string;
      status: string;
      created_at: string | null;
    }
    const activity: ActivityItem[] = [];

    for (const m of recentEnquiries) {
      activity.push({
        type: "enquiry",
        title: `New enquiry from ${m.fullName}`,
        detail: m.email,
        status: m.status,
        created_at: m.createdAt ? m.createdAt.toISOString() : null,
      });
    }
    for (const pm of recentMessages) {
      activity.push({
        type: "portal_message",
        title: `Portal message from ${pm.dashboard.clientMessage.fullName}`,
        detail: pm.subject,
        status: pm.sender,
        created_at: pm.createdAt ? pm.createdAt.toISOString() : null,
      });
    }
    for (const log of recentLogs) {
      activity.push({
        type: "log",
        title: log.message ? log.message.slice(0, 120) : "System event",
        detail: log.source ? `source: ${log.source}` : "",
        status: log.level || "info",
        created_at: log.createdAt ? log.createdAt.toISOString() : null,
      });
    }

    activity.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

    res.json({
      clients: { total: totalClients, active: activeClients, blocked: blockedClients },
      enquiries: {
        total: totalEnquiries,
        pending: pendingEnquiries,
        approved: approvedEnquiries,
        rejected: rejectedEnquiries,
      },
      by_portal: byPortal,
      activity: activity.slice(0, 10),
    });
  })
);

router.get(
  "/clients/stats/summary",
  requireRoles("Admin"),
  asyncHandler(async (_req, res) => {
    const roleNames = Object.keys(CLIENT_PORTAL_TYPES);
    const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } });
    const roleIds = roles.map((r) => r.id);

    const [total, active, blocked] = await Promise.all([
      prisma.user.count({ where: { roleId: { in: roleIds } } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, isActive: true } }),
      prisma.user.count({ where: { roleId: { in: roleIds }, isActive: false } }),
    ]);

    const byPortal: Record<string, { total: number; active: number; blocked: number }> = {};
    for (const role of roles) {
      const portal = portalTypeForRole(role.name);
      const [t, a, b] = await Promise.all([
        prisma.user.count({ where: { roleId: role.id } }),
        prisma.user.count({ where: { roleId: role.id, isActive: true } }),
        prisma.user.count({ where: { roleId: role.id, isActive: false } }),
      ]);
      byPortal[portal] = { total: t, active: a, blocked: b };
    }

    res.json({ total, active, blocked, by_portal: byPortal });
  })
);

router.post(
  "/clients",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const payload = ClientAccountCreateSchema.parse(req.body);
    const portalType = payload.portal_type.toLowerCase();
    if (!(portalType in CLIENT_PORTAL_ROLES)) {
      throw new ApiError(400, "portal_type must be evaluation, investment, marketplace or management");
    }

    const role = await prisma.role.findUnique({ where: { name: CLIENT_PORTAL_ROLES[portalType] } });
    if (!role) throw new ApiError(500, "Client portal role is not configured");

    const existing = await prisma.user.findFirst({ where: { email: { equals: payload.email, mode: "insensitive" } } });
    if (existing) throw new ApiError(400, "An account with this email already exists");

    if (payload.client_message_id) {
      const clientMessage = await prisma.clientMessage.findUnique({ where: { id: payload.client_message_id } });
      if (!clientMessage) throw new ApiError(404, "Linked enquiry not found");
      if (clientMessage.status !== ClientMessageStatus.approved) {
        throw new ApiError(400, "Only approved enquiries can be linked to a portal account");
      }
      const duplicateLink = await prisma.user.findFirst({ where: { clientMessageId: clientMessage.id } });
      if (duplicateLink) throw new ApiError(400, "This enquiry already has a portal account");
    }

    const user = await prisma.user.create({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        hashedPassword: await hashPassword(payload.password),
        roleId: role.id,
        isActive: true,
        clientMessageId: payload.client_message_id ?? undefined,
      },
      include: { role: true },
    });

    if (payload.send_welcome_email) {
      await sendWelcomeEmail(user.email, user.fullName, user.email, payload.password, portalType);
    }

    if (payload.client_message_id) {
      await runSeed(prisma, payload.client_message_id, portalType);
    }

    res.status(201).json(serializeClientAccount(user));
  })
);

router.get(
  "/clients/:clientId/services",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId } });
    if (!user) throw new ApiError(404, "Client account not found");

    const enquiryIds = new Set<string>();
    if (user.clientMessageId) enquiryIds.add(user.clientMessageId);
    const links = await prisma.userService.findMany({ where: { userId: user.id } });
    links.forEach((l) => enquiryIds.add(l.clientMessageId));

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
        services.push(
          serviceEntry(
            enquiry,
            enquiry.category,
            dashboardByEnquiry.get(enquiry.id),
            enquiry.id === user.clientMessageId
          )
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
  "/clients/:clientId/services",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId }, include: { role: true } });
    if (!user) throw new ApiError(404, "Client account not found");

    const clientMessageId = (req.body ?? {}).client_message_id;
    if (!clientMessageId) throw new ApiError(400, "client_message_id is required");

    const enquiry = await prisma.clientMessage.findUnique({ where: { id: clientMessageId } });
    if (!enquiry) throw new ApiError(404, "Enquiry not found");
    if (enquiry.status !== ClientMessageStatus.approved) {
      throw new ApiError(400, "Only approved enquiries can be linked");
    }

    const existing = await prisma.userService.findUnique({ where: { clientMessageId: enquiry.id } });
    if (existing) throw new ApiError(400, "This enquiry is already linked to an account");

    const category = await prisma.enquiryCategory.findUnique({ where: { id: enquiry.categoryId } });
    const portalType = category ? category.formType : portalTypeForRole(user.role.name);

    await prisma.userService.create({
      data: { userId: user.id, clientMessageId: enquiry.id, portalType },
    });

    await runSeed(prisma, enquiry.id, portalType);

    res.status(201).json({ message: "Service linked to client account", client_message_id: enquiry.id });
  })
);

router.delete(
  "/clients/:clientId/services/:enquiryId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId } });
    if (!user) throw new ApiError(404, "Client account not found");

    if (user.clientMessageId && user.clientMessageId === req.params.enquiryId) {
      throw new ApiError(400, "The primary service cannot be removed");
    }

    const link = await prisma.userService.findFirst({
      where: { userId: user.id, clientMessageId: req.params.enquiryId },
    });
    if (!link) throw new ApiError(404, "Service not linked to this client");

    await prisma.userService.delete({ where: { id: link.id } });
    res.json({ message: "Service removed from client account" });
  })
);

router.patch(
  "/clients/:clientId/block",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId } });
    if (!user) throw new ApiError(404, "Client account not found");
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
      include: { role: true },
    });
    res.json(serializeClientAccount(updated));
  })
);

router.patch(
  "/clients/:clientId/unblock",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId } });
    if (!user) throw new ApiError(404, "Client account not found");
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      include: { role: true },
    });
    res.json(serializeClientAccount(updated));
  })
);

router.delete(
  "/clients/:clientId",
  requireRoles("Admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.clientId } });
    if (!user) throw new ApiError(404, "Client account not found");
    await prisma.user.delete({ where: { id: user.id } });
    res.json({ message: "Client account deleted successfully" });
  })
);

export default router;
