import { Request } from "express";

export function intParam(req: Request, key: string, defaultValue: number, opts?: { min?: number; max?: number }): number {
  const raw = req.query[key];
  if (raw === undefined || raw === "") return defaultValue;
  let value = Number(raw);
  if (Number.isNaN(value)) return defaultValue;
  if (opts?.min !== undefined) value = Math.max(opts.min, value);
  if (opts?.max !== undefined) value = Math.min(opts.max, value);
  return value;
}

export function boolParam(req: Request, key: string): boolean | undefined {
  const raw = req.query[key];
  if (raw === undefined || raw === "") return undefined;
  return raw === "true" || raw === "1";
}

export function stringParam(req: Request, key: string): string | undefined {
  const raw = req.query[key];
  if (raw === undefined || raw === "") return undefined;
  return String(raw);
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}
