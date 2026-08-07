import express, { Request, Response } from "express";
import cors from "cors";
import { settings } from "./config";
import { prisma } from "./db";
import { logger } from "./logger";
import { apiRouter } from "./routes";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimit";

export const app = express();

app.use(express.json());

// Security headers middleware (equivalent of the FastAPI add_security_headers middleware)
app.use((req: Request, res: Response, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (settings.ENVIRONMENT === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin: settings.allowedOriginsList,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 3600,
  })
);

// Default global rate limit (matches Limiter(default_limits=["100/minute"]))
app.use(rateLimiter("100/minute"));

app.use("/api/v1", apiRouter);

logger.info(settings.DATABASE_URL);

app.get(
  "/",
  rateLimiter("10/minute"),
  (_req: Request, res: Response) => {
    res.json({ Hello: "World" });
  }
);

app.get(
  "/health",
  rateLimiter("30/minute"),
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "Healthy", database: "connected" });
    } catch (err) {
      res.status(503).json({ detail: `Database connection failed ${err}` });
    }
  })
);

app.use(errorHandler);
