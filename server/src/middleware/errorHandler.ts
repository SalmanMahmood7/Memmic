import { Request, Response, NextFunction } from "express";
import { ApiError } from "../core/apiError";
import { ZodError } from "zod";
import { logger } from "../logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (err.headers) {
      for (const [key, value] of Object.entries(err.headers)) res.setHeader(key, value);
    }
    res.status(err.status).json({ detail: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({ detail: err.issues });
    return;
  }

  logger.error(err?.stack ?? err);
  res.status(500).json({ detail: "Internal server error" });
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Wraps an async Express handler so rejected promises reach the error middleware. */
export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
