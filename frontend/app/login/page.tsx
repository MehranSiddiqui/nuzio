"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

type Mode = "google" | "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("google");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/brief");
  }, [loading, user, router]);

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    try {
      await api.loginWithGoogle();
      await refresh();
      router.replace("/brief");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        await api.register(name, email, password);
      } else {
        await api.login(email, password);
      }
      await refresh();
      router.replace("/brief");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 overflow-hidden">
      <div className="glow-purple absolute inset-x-0 top-0 h-[420px] pointer-events-none" />

      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        <Logo size={72} />

        <h1 className="mt-8 text-3xl font-semibold text-white">Good morning.</h1>
        <p className="tagline text-2xl text-violet-400 mt-1">News on go.</p>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          Personalised audio news for Indian professionals — curated every morning.
        </p>

        <div className="mt-10 w-full flex flex-col gap-3">
          {mode === "google" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-white text-[#1a1a1a] font-medium py-3.5 disabled:opacity-60 transition hover:bg-white/90"
              >
                <GoogleIcon />
                {busy ? "Signing in…" : "Continue with Google"}
              </button>

              <button
                onClick={() => setMode("signin")}
                className="text-sm text-text-secondary hover:text-white transition mt-2"
              >
                or continue with email
              </button>
            </>
          )}

          {(mode === "signin" || mode === "signup") && (
            <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3 text-left">
              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="card-surface rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-tertiary outline-none focus:border-violet-500"
                />
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                required
                className="card-surface rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-tertiary outline-none focus:border-violet-500"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                required
                minLength={6}
                className="card-surface rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-tertiary outline-none focus:border-violet-500"
              />

              <button
                type="submit"
                disabled={busy}
                className="gradient-cta w-full rounded-full text-white font-medium py-3.5 mt-1 disabled:opacity-60 transition"
              >
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-sm text-text-secondary hover:text-white transition"
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>

              <button
                type="button"
                onClick={() => setMode("google")}
                className="text-xs text-text-tertiary hover:text-white transition"
              >
                ← back
              </button>
            </form>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 w-full">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-text-tertiary">
          By continuing you agree to our{" "}
          <span className="underline underline-offset-2">Terms</span> &{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
