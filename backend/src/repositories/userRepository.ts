import { User } from "../types";

export interface UserRepository {
  create(user: Omit<User, "id" | "createdAt">): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  update(id: string, patch: Partial<User>): Promise<User | undefined>;
}

class InMemoryUserRepository implements UserRepository {
  private usersById = new Map<string, User>();
  private usersByEmail = new Map<string, string>();
  private nextId = 1;

  async create(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = String(this.nextId++);
    const fullUser: User = { ...user, id, createdAt: new Date().toISOString() };
    this.usersById.set(id, fullUser);
    this.usersByEmail.set(user.email.toLowerCase(), id);
    return fullUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const id = this.usersByEmail.get(email.toLowerCase());
    return id ? this.usersById.get(id) : undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersById.get(id);
  }

  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    const existing = this.usersById.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, id: existing.id };
    this.usersById.set(id, updated);
    return updated;
  }
}

export const userRepository: UserRepository = new InMemoryUserRepository();
