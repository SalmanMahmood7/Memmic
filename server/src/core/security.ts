import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { settings } from "../config";

const BCRYPT_ROUNDS = 12; // matches passlib's bcrypt default work factor

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export interface TokenData {
  sub: string;
  role: string;
  [key: string]: unknown;
}

export interface DecodedToken extends TokenData {
  type: "access" | "refresh";
  exp: number;
  iat?: number;
}

function signToken(data: TokenData, type: "access" | "refresh", expiresInSeconds: number): string {
  const payload = { ...data, type };
  return jwt.sign(payload, settings.SECRET_KEY, {
    algorithm: settings.ALGORITHM as jwt.Algorithm,
    expiresIn: expiresInSeconds,
  });
}

export function createAccessToken(data: TokenData): string {
  return signToken(data, "access", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60);
}

export function createRefreshToken(data: TokenData): string {
  return signToken(data, "refresh", settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60);
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, settings.SECRET_KEY, {
      algorithms: [settings.ALGORITHM as jwt.Algorithm],
    }) as DecodedToken;
  } catch {
    return null;
  }
}
