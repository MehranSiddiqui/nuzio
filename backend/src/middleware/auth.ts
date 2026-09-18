import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import { userRepository } from "../repositories/userRepository";
import { COOKIE_NAME, verifyToken } from "../utils/auth";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw new UnauthorizedError();

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new UnauthorizedError();

  req.user = user;
  next();
}
