export function Logo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: "linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)",
        boxShadow: "0 0 40px rgba(139, 92, 246, 0.45)",
      }}
    >
      N
    </div>
  );
}
