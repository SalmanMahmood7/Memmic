import rateLimit from "express-rate-limit";

/**
 * Equivalent of slowapi's Limiter.limit("N/period") decorator.
 * Uses an in-memory store, matching the Python app's actual behaviour
 * (its Limiter is constructed without storage_uri, so it is in-memory too
 * despite REDIS_URL being configured for other purposes).
 */
export function rateLimiter(limit: string) {
  const [countStr, period] = limit.split("/");
  const count = Number(countStr);
  const perMs: Record<string, number> = {
    second: 1_000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
  };
  const windowMs = perMs[period] ?? 60_000;

  return rateLimit({
    windowMs,
    max: count,
    standardHeaders: true,
    legacyHeaders: false,
    message: { detail: "Rate limit exceeded" },
  });
}
