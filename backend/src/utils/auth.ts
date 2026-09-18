import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthTokenPayload } from "../types";

export const COOKIE_NAME = "nuzio_token";

export const cookieOptions = {
  httpOnly: true,
  sameSite: (config.isProduction ? "none" : "lax") as "none" | "lax",
  secure: config.isProduction,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export function signToken(userId: string): string {
  const payload: AuthTokenPayload = { sub: userId };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
  } catch {
    return null;
  }
}
