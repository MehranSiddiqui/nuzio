export function PlayButton({
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
