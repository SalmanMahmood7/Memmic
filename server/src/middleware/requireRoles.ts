import { Request, Response, NextFunction, RequestHandler } from "express";
import { getCurrentUser } from "./auth";
import { ApiError } from "../core/apiError";

/**
 * Equivalent of app.core.premissions.require_roles(*allowed_roles).
 * Authenticates the bearer token, loads the user, and enforces role membership.
 * Attaches the authenticated user to req.currentUser.
 */
export function requireRoles(...allowedRoles: string[]): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getCurrentUser(req);
      if (!allowedRoles.includes(user.role.name)) {
        throw new ApiError(
          403,
          `This action requires one of the following roles: ${allowedRoles.join(", ")}`
        );
      }
      req.currentUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
