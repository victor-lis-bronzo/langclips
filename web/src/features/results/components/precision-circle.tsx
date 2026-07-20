import { useGetDeckExercises } from "../hooks/use-get-deck-exercises";

type PrecisionCircleProps = {
  deckId: string;
};

export default function PrecisionCircle({ deckId }: PrecisionCircleProps) {
  const {
    data: exercises,
    isError,
    isLoading,
  } = useGetDeckExercises({ deckId });

  if (isLoading) {
    return (
      <div className="w-[240px] h-[260px] animate-pulse bg-card rounded-[24px] border border-white/10" />
    );
  }

  if (isError) {
    return (
      <div className="w-[240px] h-[260px] flex items-center justify-center bg-card rounded-[24px] border border-white/10 text-muted-foreground">
        Erro ao carregar
      </div>
    );
  }

  const correctAnswers = exercises?.filter(
    (exercise) => exercise.status === "CORRECT",
  );

  const totalExercises = exercises?.length || 0;

  const correctPercentage =
    totalExercises > 0
      ? Math.round(((correctAnswers?.length || 0) / totalExercises) * 100)
      : 0;

  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (correctPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card border border-white/10 rounded-[20px] w-full max-w-[280px]">
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#262626"
            strokeWidth={strokeWidth}
          />
          {/* Progress Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>

        {/* Inner Text */}
        <div className="absolute flex flex-col items-center justify-center mt-1">
          <span className="font-caveat text-[48px] font-bold text-white leading-none">
            {correctPercentage}%
          </span>
          <span className="text-[10px] text-muted-foreground font-inter uppercase tracking-[0.2em] mt-2 ml-1">
            Precisão
          </span>
        </div>
      </div>

      {/* Bottom Message */}
      {/* <span className="font-caveat text-3xl text-primary font-bold mt-6">
        Ótimo trabalho!
      </span> */}
    </div>
  );
}
