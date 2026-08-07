import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const settings = {
  DATABASE_URL: required("DATABASE_URL"),

  SECRET_KEY: required("SECRET_KEY"),
  ALGORITHM: process.env.ALGORITHM ?? "HS256",
  ACCESS_TOKEN_EXPIRE_MINUTES: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES ?? 30),
  REFRESH_TOKEN_EXPIRE_DAYS: Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS ?? 7),

  REDIS_URL: required("REDIS_URL"),

  ENVIRONMENT: process.env.ENVIRONMENT ?? "Development",
  DEBUG: (process.env.DEBUG ?? "True").toLowerCase() === "true",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? "localhost:4000",
  PORT: Number(process.env.PORT ?? 8000),

  // Optional: notification emails are best-effort (see services/email.ts, which
  // already swallows send failures), so a missing SMTP config shouldn't block
  // the API from starting or the contact/enquiry forms from working.
  MAIL_USERNAME: process.env.MAIL_USERNAME ?? "",
  MAIL_PASSWORD: process.env.MAIL_PASSWORD ?? "",
  MAIL_FROM: process.env.MAIL_FROM ?? "",
  MAIL_PORT: Number(process.env.MAIL_PORT ?? 587),
  MAIL_SERVER: process.env.MAIL_SERVER ?? "",

  get allowedOriginsList(): string[] {
    return this.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
  },
};
