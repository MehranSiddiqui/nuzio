import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { COOKIE_NAME, requireAuth, signToken } from "../auth";
import { createUser, findUserByEmail, toPublicUser, updateUser } from "../store";

const router = Router();

// In production the frontend (vercel.app) and API (onrender.com) live on
// different domains, so the cookie must be SameSite=None + Secure to survive
// the cross-site fetch. Locally both run on localhost so Lax is enough.
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  secure: isProd,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }
  const { name, email, password } = parsed.data;

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createUser({
    name,
    email,
    passwordHash,
    provider: "password",
    avatarInitials: initials(name),
    niches: [],
    voice: "aria",
  });

  const token = signToken(user.id);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ user: toPublicUser(user) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid email and password" });
  }
  const { email, password } = parsed.data;

  const user = findUserByEmail(email);
  if (!user || !user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const token = signToken(user.id);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user: toPublicUser(user) });
});

// Demo "Continue with Google" — simulates an OAuth provider so the flow works
// end-to-end without needing real Google OAuth credentials. Swap this handler
// for a verified Google ID token exchange when real credentials are available.
const googleSchema = z.object({
  name: z.string().min(2).default("Aaraav Sharma"),
  email: z.string().email().default("aaraav.sharma@example.com"),
});

router.post("/google", (req, res) => {
  const parsed = googleSchema.safeParse(req.body ?? {});
  const { name, email } = parsed.success ? parsed.data : { name: "Aaraav Sharma", email: "aaraav.sharma@example.com" };

  let user = findUserByEmail(email);
  if (!user) {
    user = createUser({
      name,
      email,
      provider: "google",
      avatarInitials: initials(name),
      niches: ["AI & Technology", "Financial Markets", "Startups"],
      voice: "aria",
    });
  }

  const token = signToken(user.id);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ user: toPublicUser(user) });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user!) });
});

const preferencesSchema = z.object({
  profession: z.string().min(1).optional(),
  niches: z.array(z.string()).optional(),
  voice: z.string().optional(),
});

router.patch("/me", requireAuth, (req, res) => {
  const parsed = preferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid preferences" });
  }
  const updated = updateUser(req.user!.id, parsed.data);
  res.json({ user: toPublicUser(updated!) });
});

export default router;
