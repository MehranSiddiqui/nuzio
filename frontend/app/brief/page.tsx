"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Waveform } from "@/components/Waveform";
import { ArticleCard } from "@/components/ArticleCard";
import { useAuth } from "@/lib/auth-context";
import { api, BriefResponse, NewsArticle } from "@/lib/api";
import { useNarrator } from "@/lib/use-narrator";

function formatDuration(totalSec: number) {
  const min = Math.round(totalSec / 60);
  return `${min} min`;
}

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function BriefPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [discover, setDiscover] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [loadingBrief, setLoadingBrief] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api.brief().then((data) => {
      setBrief(data);
      setLoadingBrief(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      api.discover({ category, q: query || undefined }).then((data) => setDiscover(data.articles));
    }, 150);
    return () => clearTimeout(timeout);
  }, [user, category, query]);

  const narrator = useNarrator(brief?.articles ?? [], brief?.voice);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    discover.forEach((a) => set.add(a.category));
    (brief?.articles ?? []).forEach((a) => set.add(a.category));
    return Array.from(set);
  }, [discover, brief]);

  const nowPlaying = brief?.articles.find((a) => a.id === narrator.playingId);

  async function handleLogout() {
    narrator.stop();
    await logout();
    router.replace("/login");
  }

  if (authLoading || !user) {
    return <div className="flex-1 flex items-center justify-center text-text-secondary">Loading…</div>;
  }

  return (
    <main className="relative flex-1 min-h-screen pb-16">
      <div className="glow-purple absolute inset-x-0 top-0 h-[360px] pointer-events-none" />

      <header className="relative flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-semibold tracking-wide text-white">Nuzio</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-text-secondary hover:text-white transition border border-white/10 rounded-full px-3 py-1.5"
        >
          Sign out
        </button>
      </header>

      <section className="relative px-5 mt-6">
        <h1 className="text-2xl font-semibold text-white">
          {timeOfDayGreeting()}, {brief?.greetingName ?? user.name.split(" ")[0]}
          {brief ? <span className="text-text-secondary"> — {brief.itemCount} things</span> : null}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {loadingBrief
            ? "Curating your morning brief…"
            : `${brief?.voice.name} · ${brief?.voice.language} (${brief?.voice.accent}) · ${formatDuration(
                brief?.totalAudioSec ?? 0
              )} audio brief`}
        </p>

        <div className="card-surface rounded-3xl p-5 mt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-tertiary">
                {narrator.playingId ? "Now playing" : "Your audio brief"}
              </p>
              <p className="text-white font-medium mt-1 line-clamp-1 max-w-[220px]">
                {nowPlaying?.title ?? "Tap play to start listening"}
              </p>
            </div>
            <PlayButton
              isPlaying={Boolean(narrator.playingId) && !narrator.isPaused}
              supported={narrator.supported}
              onClick={() => {
                if (!narrator.supported) return;
                if (narrator.playingId && !narrator.isPaused) {
                  narrator.pause();
                } else if (narrator.playingId && narrator.isPaused) {
                  narrator.resume();
                } else {
                  narrator.playFrom();
                }
              }}
            />
          </div>
          <Waveform playing={Boolean(narrator.playingId) && !narrator.isPaused} />
          {!narrator.supported && (
            <p className="text-xs text-text-tertiary">
              Audio playback needs a browser with speech synthesis support (e.g. Chrome or Edge).
            </p>
          )}
        </div>
      </section>

      <section className="relative px-5 mt-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 text-xs px-3.5 py-2 rounded-full border transition ${
                category === c
                  ? "bg-violet-500 border-violet-500 text-white"
                  : "border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories, sources, topics…"
          className="w-full card-surface rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-tertiary outline-none focus:border-violet-500 mt-3"
        />

        <div className="flex flex-col gap-3 mt-4">
          {discover.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isPlaying={narrator.playingId === article.id && !narrator.isPaused}
              onPlay={() => {
                if (narrator.playingId === article.id) {
                  narrator.isPaused ? narrator.resume() : narrator.pause();
                } else {
                  narrator.playFrom(article.id);
                }
              }}
            />
          ))}
          {discover.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-8">No stories match that search.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function PlayButton({
  isPlaying,
  supported,
  onClick,
}: {
  isPlaying: boolean;
  supported: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!supported}
      className="gradient-cta w-14 h-14 rounded-full flex items-center justify-center text-white disabled:opacity-40 shrink-0"
      aria-label={isPlaying ? "Pause brief" : "Play brief"}
    >
      {isPlaying ? (
        <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor">
          <rect x="2" y="1.5" width="3.5" height="11" />
          <rect x="8.5" y="1.5" width="3.5" height="11" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 14 14" fill="currentColor">
          <path d="M2 1.5v11l10-5.5-10-5.5z" />
        </svg>
      )}
    </button>
  );
}
