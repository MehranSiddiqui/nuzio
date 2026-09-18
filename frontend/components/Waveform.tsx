const BAR_HEIGHTS = [40, 70, 45, 90, 55, 75, 35, 60, 85, 50, 65, 40, 95, 55, 70, 45, 80, 60, 40, 75];

export function Waveform({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-14">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-violet-400"
          style={{
            height: `${h}%`,
            opacity: playing ? 0.9 : 0.35,
            animation: playing ? `nuzio-bar 1.1s ease-in-out ${(i % 6) * 0.09}s infinite` : "none",
            transformOrigin: "bottom",
          }}
        />
      ))}
      <style>{`
        @keyframes nuzio-bar {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
