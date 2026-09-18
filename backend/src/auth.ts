import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthTokenPayload } from "./types";
import { findUserById } from "./store";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const COOKIE_NAME = "nuzio_token";

export function signToken(userId: string): string {
  const payload: AuthTokenPayload = { sub: userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = findUserById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = user;
  next();
}
