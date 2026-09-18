"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Waveform } from "@/components/Waveform";
import { ArticleCard } from "@/components/ArticleCard";
import { PlayButton } from "@/components/PlayButton";
import { useAuth } from "@/lib/auth-context";
import { useBrief, useDiscover } from "@/lib/hooks";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useNarrator } from "@/lib/use-narrator";
import { formatDuration, timeOfDayGreeting } from "@/lib/format";

export default function BriefDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: brief, isLoading: loadingBrief, error: briefError } = useBrief(Boolean(user));
  const { data: discoverData, error: discoverError } = useDiscover(Boolean(user), {
    category,
    q: debouncedQuery,
  });
  const discover = useMemo(() => discoverData?.articles ?? [], [discoverData]);

  const narrator = useNarrator(brief?.articles ?? [], brief?.voice);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    discover.forEach((article) => set.add(article.category));
    (brief?.articles ?? []).forEach((article) => set.add(article.category));
    return Array.from(set);
  }, [discover, brief]);

  const nowPlaying = brief?.articles.find((article) => article.id === narrator.playingId);

  async function handleLogout() {
    narrator.stop();
    await logout();
    router.replace("/login");
  }

  if (authLoading || !user) {
    return <div className="flex-1 flex items-center justify-center text-text-secondary">Loading...</div>;
  }

  return (
    <main className="relative flex-1 min-h-screen pb-16">
      <div className="glow-purple absolute inset-x-0 top-0 h-90 pointer-events-none" />

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
          {brief ? <span className="text-text-secondary"> - {brief.itemCount} things</span> : null}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {loadingBrief
            ? "Curating your morning brief..."
            : briefError
              ? "Couldn't load your brief. Try again shortly."
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
              <p className="text-white font-medium mt-1 line-clamp-1 max-w-55">
                {nowPlaying?.title ?? "Tap play to start listening"}
              </p>
            </div>
            <PlayButton
              isPlaying={Boolean(narrator.playingId) && !narrator.isPaused}
              supported={narrator.supported}
              onClick={() => {
                if (!narrator.supported) return;
                if (narrator.playingId && !narrator.isPaused) narrator.pause();
                else if (narrator.playingId && narrator.isPaused) narrator.resume();
                else narrator.playFrom();
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
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 text-xs px-3.5 py-2 rounded-full border transition ${
                category === item
                  ? "bg-violet-500 border-violet-500 text-white"
                  : "border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stories, sources, topics..."
          className="w-full card-surface rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-tertiary outline-none focus:border-violet-500 mt-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {discoverError && (
            <p className="col-span-full text-sm text-red-400 text-center py-8">
              Couldn&apos;t load stories. Try again shortly.
            </p>
          )}
          {discover.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isPlaying={narrator.playingId === article.id && !narrator.isPaused}
              onPlay={() => {
                if (narrator.playingId === article.id) {
                  if (narrator.isPaused) narrator.resume();
                  else narrator.pause();
                } else {
                  narrator.playFrom(article.id);
                }
              }}
            />
          ))}
          {!discoverError && discoverData && discover.length === 0 && (
            <p className="col-span-full text-sm text-text-tertiary text-center py-8">No stories match that search.</p>
          )}
        </div>
      </section>
    </main>
  );
}
