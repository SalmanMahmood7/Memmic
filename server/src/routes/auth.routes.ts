import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../middleware/errorHandler";
import { rateLimiter } from "../middleware/rateLimit";
import { ApiError } from "../core/apiError";
import { logger } from "../logger";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshRequestSchema,
} from "../schemas/auth.schema";
import { hashPassword, verifyPassword, createAccessToken, createRefreshToken, decodeToken } from "../core/security";

const router = Router();

router.post(
  "/register",
  rateLimiter("5/minute"),
  asyncHandler(async (req, res) => {
    const payload = RegisterRequestSchema.parse(req.body);

    const existing = await prisma.user.findFirst({ where: { email: payload.email } });
    if (existing) throw new ApiError(400, "Email already exists");

    const role = await prisma.role.findUnique({ where: { id: payload.role_id } });
    if (!role) throw new ApiError(400, "Invalid role_id");

    const user = await prisma.user.create({
      data: {
        fullName: payload.full_name,
        email: payload.email,
        hashedPassword: await hashPassword(payload.password),
        roleId: role.id,
      },
    });

    res.status(201).json({
      message: "Registration Successfull",
      user_id: user.id,
    });
  })
);

router.post(
  "/login",
  rateLimiter("10/minute"),
  asyncHandler(async (req, res) => {
    const payload = LoginRequestSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email: { equals: payload.email, mode: "insensitive" } },
      include: { role: true },
    });

    // Deliberately vague error - don't reveal whether email exists
    if (!user || !(await verifyPassword(payload.password, user.hashedPassword))) {
      throw new ApiError(401, "Incorrect email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account has been blocked. Contact support.");
    }

    const tokenData = { sub: user.id, role: user.role.name };
    logger.info(`User Role name = ${user.role.name}`);

    res.json({
      access_token: createAccessToken(tokenData),
      refresh_token: createRefreshToken(tokenData),
      token_type: "bearer",
    });
  })
);

router.post(
  "/refresh",
  rateLimiter("20/minute"),
  asyncHandler(async (req, res) => {
    const payload = RefreshRequestSchema.parse(req.body);

    const decoded = decodeToken(payload.refresh_token);
    if (!decoded || decoded.type !== "refresh") {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.sub }, include: { role: true } });
    if (!user) throw new ApiError(401, "Invalid refresh token");
    if (!user.isActive) throw new ApiError(403, "This account has been blocked. Contact support.");

    const tokenData = { sub: user.id, role: user.role.name };
    res.json({
      access_token: createAccessToken(tokenData),
      refresh_token: createRefreshToken(tokenData),
      token_type: "bearer",
    });
  })
);

export default router;
