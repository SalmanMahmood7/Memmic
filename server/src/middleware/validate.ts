import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../core/apiError";

/** Validates req.body against a Zod schema and replaces req.body with the parsed value. */
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError(422, JSON.stringify(result.error.issues)));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Validates req.query against a Zod schema and replaces req.query with the parsed value. */
export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ApiError(422, JSON.stringify(result.error.issues)));
      return;
    }
    (req as unknown as { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
}
