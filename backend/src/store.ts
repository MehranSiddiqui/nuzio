import { User } from "./types";

// In-memory store. Fine for a demo/assignment; swap for a real database later.
const usersById = new Map<string, User>();
const usersByEmail = new Map<string, string>();

let nextId = 1;

export function createUser(user: Omit<User, "id" | "createdAt">): User {
  const id = String(nextId++);
  const fullUser: User = { ...user, id, createdAt: new Date().toISOString() };
  usersById.set(id, fullUser);
  usersByEmail.set(user.email.toLowerCase(), id);
  return fullUser;
}

export function findUserByEmail(email: string): User | undefined {
  const id = usersByEmail.get(email.toLowerCase());
  return id ? usersById.get(id) : undefined;
}

export function findUserById(id: string): User | undefined {
  return usersById.get(id);
}

export function updateUser(id: string, patch: Partial<User>): User | undefined {
  const existing = usersById.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch, id: existing.id };
  usersById.set(id, updated);
  return updated;
}

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
