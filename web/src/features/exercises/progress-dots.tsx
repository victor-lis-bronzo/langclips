interface ProgressDotsProps {
  current: number;
  total: number;
  maxDots?: number;
}

export function ProgressDots({ current, total, maxDots = 5 }: ProgressDotsProps) {
  let start = 1;
  let end = total;

  if (total > maxDots) {
    if (current <= 3) {
      start = 1;
      end = maxDots;
    } else if (current >= total - 2) {
      start = total - maxDots + 1;
      end = total;
    } else {
      start = current - 2;
      end = current + 2;
    }
  }

  const dots = Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, i) => start + i,
  );

  return (
    <div className="flex gap-1.5 items-center">
      {dots.map((dotNum) => (
        <div
          key={dotNum}
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            dotNum === current
              ? "bg-primary"
              : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}
