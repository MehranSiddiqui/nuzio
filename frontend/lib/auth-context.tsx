"use client";

import { createContext, useCallback, useContext } from "react";
import useSWR from "swr";
import { api, PublicUser } from "./api";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchCurrentUser(): Promise<PublicUser | null> {
  try {
    const { user } = await api.me();
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useSWR("me", fetchCurrentUser, {
    revalidateOnFocus: false,
  });

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const logout = useCallback(async () => {
    await api.logout();
    await mutate(null, false);
  }, [mutate]);

  return (
    <AuthContext.Provider value={{ user: data ?? null, loading: isLoading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
