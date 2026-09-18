export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  provider: "google" | "password";
  avatarInitials: string;
  profession?: string;
  niches: string[];
  voice: string;
  createdAt: string;
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

export interface AuthTokenPayload {
  sub: string;
}
