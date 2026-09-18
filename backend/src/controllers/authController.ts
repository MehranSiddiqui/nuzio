import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { ConflictError, UnauthorizedError } from "../errors";
import { userRepository } from "../repositories/userRepository";
import { GoogleInput, LoginInput, PreferencesInput, RegisterInput } from "../schemas/auth";
import { COOKIE_NAME, cookieOptions, signToken } from "../utils/auth";
import { initials, toPublicUser } from "../utils/user";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body as RegisterInput;

  if (await userRepository.findByEmail(email)) {
    throw new ConflictError("An account with this email already exists");
  }

  const user = await userRepository.create({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    provider: "password",
    avatarInitials: initials(name),
    niches: [],
    voice: "aria",
  });

  setAuthCookie(res, user.id);
  return res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;
  const user = await userRepository.findByEmail(email);
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  setAuthCookie(res, user.id);
  return res.json({ user: toPublicUser(user) });
}

export async function loginWithGoogle(req: Request, res: Response) {
  const { name, email } = req.body as GoogleInput;

  let user = await userRepository.findByEmail(email);
  if (!user) {
    user = await userRepository.create({
      name,
      email,
      provider: "google",
      avatarInitials: initials(name),
      niches: ["AI & Technology", "Financial Markets", "Startups"],
      voice: "aria",
    });
  }

  setAuthCookie(res, user.id);
  return res.json({ user: toPublicUser(user) });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  return res.status(204).end();
}

export function getCurrentUser(req: Request, res: Response) {
  return res.json({ user: toPublicUser(req.user!) });
}

export async function updatePreferences(req: Request, res: Response) {
  const patch = req.body as PreferencesInput;
  const updated = await userRepository.update(req.user!.id, patch);
  return res.json({ user: toPublicUser(updated!) });
}

function setAuthCookie(res: Response, userId: string) {
  res.cookie(COOKIE_NAME, signToken(userId), cookieOptions);
}
