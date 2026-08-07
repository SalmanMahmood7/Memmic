import { Request } from "express";
import { prisma } from "../db";
import { decodeToken } from "../core/security";
import { ApiError } from "../core/apiError";
import { CurrentUser } from "../types/express";

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/** Equivalent of app.dependencies.get_current_user */
export async function getCurrentUser(req: Request): Promise<CurrentUser> {
  const credentialsError = new ApiError(401, "Could not validate credentials", {
    "WWW-Authenticate": "Bearer",
  });

  const token = extractBearerToken(req);
  if (!token) throw credentialsError;

  const payload = decodeToken(token);
  if (!payload || payload.type !== "access") throw credentialsError;

  const userId = payload.sub;
  if (!userId) throw credentialsError;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) throw credentialsError;

  return user;
}
