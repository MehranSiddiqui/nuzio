export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {}
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  provider: "google" | "password";
  avatarInitials: string;
  profession?: string;
  niches: string[];
  voice: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  narration: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
  readTimeMin: number;
  audioSec: number;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  accent: string;
}

export interface BriefResponse {
  greetingName: string;
  itemCount: number;
  totalAudioSec: number;
  voice: Voice;
  articles: NewsArticle[];
}

export const api = {
  me: () => request<{ user: PublicUser }>("/api/auth/me"),
  loginWithGoogle: (name?: string, email?: string) =>
    request<{ user: PublicUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    }),
  login: (email: string, password: string) =>
    request<{ user: PublicUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ user: PublicUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  brief: () => request<BriefResponse>("/api/news/brief"),
  discover: (params?: { category?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ articles: NewsArticle[] }>(`/api/news/discover${suffix}`);
  },
};
