interface BeatIndicatorProps {
  total: number;
  current: number;
}

export function BeatIndicator({ total, current }: BeatIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-8 bg-ink" : "w-1.5 bg-ink/25"
          }`}
        />
      ))}
    </div>
  );
}
