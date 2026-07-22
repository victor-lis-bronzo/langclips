import { cn } from "#/lib/utils";

export interface DotStatus {
  num: number;
  status: "correct" | "wrong" | "unanswered";
}

interface ProgressDotsProps {
  current: number;
  total: number;
  statuses?: DotStatus[];
  maxDots?: number;
}

const DOT_SIZE = 28; // w-7 = 28px
const GAP = 8; // gap-2 = 8px

export function ProgressDots({
  current,
  total,
  statuses = [],
  maxDots = 5,
}: ProgressDotsProps) {
  if (total <= 0) return null;

  let windowStart = 1;
  if (total > maxDots) {
    if (current <= 3) {
      windowStart = 1;
    } else if (current >= total - 2) {
      windowStart = total - maxDots + 1;
    } else {
      windowStart = current - 2;
    }
  }

  const visibleCount = Math.min(total, maxDots);
  const viewportWidth = visibleCount * DOT_SIZE + (visibleCount - 1) * GAP;
  const translateX = -(windowStart - 1) * (DOT_SIZE + GAP);

  const allDots = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div
      className="relative overflow-hidden p-2"
      style={{ width: `${viewportWidth + 16}px` }} // +8px padding para o ring/shadow não ser cortado
    >
      <div
        className="flex items-center gap-2 transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {allDots.map((dotNum) => {
          const isCurrent = dotNum === current;
          const dotStatus =
            statuses.find((s) => s.num === dotNum)?.status ?? "unanswered";

          return (
            <div
              key={dotNum}
              className="flex items-center justify-center shrink-0"
              style={{ width: `${DOT_SIZE}px`, height: `${DOT_SIZE}px` }}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300 font-semibold select-none",
                  isCurrent
                    ? "w-7 h-7 text-xs scale-110 ring-2 ring-offset-2 ring-offset-background shadow-md z-10"
                    : "w-6 h-6 text-[10px] opacity-85 hover:opacity-100",
                  // Status Colors
                  dotStatus === "correct" &&
                    (isCurrent
                      ? "bg-emerald-500 text-white ring-emerald-500"
                      : "bg-emerald-500/90 text-white"),
                  dotStatus === "wrong" &&
                    (isCurrent
                      ? "bg-rose-500 text-white ring-rose-500"
                      : "bg-rose-500/90 text-white"),
                  dotStatus === "unanswered" &&
                    (isCurrent
                      ? "bg-blue-500 text-white ring-blue-500"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700"),
                )}
              >
                {dotNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
