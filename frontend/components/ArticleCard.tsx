import { NewsArticle } from "@/lib/api";

export function ArticleCard({
  article,
  isPlaying,
  onPlay,
}: {
  article: NewsArticle;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      className={`card-surface rounded-2xl p-4 flex flex-col gap-3 transition ${
        isPlaying ? "border-violet-500/60 bg-violet-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] uppercase tracking-wide text-violet-300 bg-violet-500/15 px-2 py-1 rounded-full">
          {article.category}
        </span>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] uppercase tracking-wide text-text-secondary hover:text-white transition px-2 py-1 rounded-full border border-white/10 flex items-center gap-1"
        >
          {article.source} <span aria-hidden>↗</span>
        </a>
      </div>

      <p className="text-white text-[15px] leading-snug font-medium">{article.title}</p>
      <p className="text-text-secondary text-sm leading-relaxed">{article.summary}</p>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-text-tertiary">
          {article.readTimeMin} min read · {Math.round(article.audioSec / 60) || 1} min listen
        </span>
        <button
          onClick={onPlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
            isPlaying ? "bg-accent-green text-black" : "bg-white text-black hover:bg-white/90"
          }`}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M2 1.5v11l10-5.5-10-5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2" y="1.5" width="3.5" height="11" />
      <rect x="8.5" y="1.5" width="3.5" height="11" />
    </svg>
  );
}
