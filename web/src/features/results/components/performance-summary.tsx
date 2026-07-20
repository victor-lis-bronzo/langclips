import { useGetDeckExercises } from "../hooks/use-get-deck-exercises";

type PerformanceSummaryProps = {
  deckId: string;
};

export default function PerformanceSummary({
  deckId,
}: PerformanceSummaryProps) {
  const {
    data: exercises,
    isError,
    isLoading,
  } = useGetDeckExercises({ deckId });

  if (isLoading) {
    return (
      <div className="flex-1 animate-pulse bg-card rounded-[24px] border border-white/10 min-h-[300px]" />
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card rounded-[24px] border border-white/10 text-muted-foreground min-h-[300px]">
        Erro ao carregar
      </div>
    );
  }

  const correctAnswers =
    exercises?.filter((exercise) => exercise.status === "CORRECT") || [];
  const wrongAnswers =
    exercises?.filter((exercise) => exercise.status === "WRONG") || [];
  const totalExercises = exercises?.length || 0;

  const correctCount = correctAnswers.length;
  const wrongCount = wrongAnswers.length;

  const correctPercentage =
    totalExercises > 0 ? (correctCount / totalExercises) * 100 : 0;
  const wrongPercentage =
    totalExercises > 0 ? (wrongCount / totalExercises) * 100 : 0;

  return (
    <div className="flex flex-col p-8 bg-card border border-white/10 rounded-[24px] flex-1 min-w-[320px]">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <h2 className="font-caveat text-[40px] font-bold text-white leading-none">
          Performance
        </h2>
        <span className="text-[10px] text-muted-foreground font-inter uppercase tracking-[0.15em] mt-1 ml-1">
          Summary of clips
        </span>
      </div>

      {/* Exercises List */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar">
        {exercises?.map((exercise, index) => {
          const isCorrect = exercise.status === "CORRECT";
          return (
            <div
              key={exercise.id || index}
              className={`flex-shrink-0 flex items-center justify-center w-[48px] h-[48px] rounded-full border-[1.5px] ${
                isCorrect
                  ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                  : "border-destructive text-destructive bg-destructive/10 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
              }`}
            >
              <span className="font-caveat text-2xl font-bold mt-1">
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-6 mt-auto">
        {/* Correct Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-inter font-bold text-white text-sm">
              Hits
            </span>
            <span className="font-caveat text-primary font-bold text-2xl leading-none">
              {correctCount}/{totalExercises}
            </span>
          </div>
          <div className="h-[6px] w-full bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${correctPercentage}%` }}
            />
          </div>
        </div>

        {/* Wrong Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-inter font-bold text-white text-sm">
              Mistakes
            </span>
            <span className="font-caveat text-destructive font-bold text-2xl leading-none">
              {wrongCount}/{totalExercises}
            </span>
          </div>
          <div className="h-[6px] w-full bg-[#333] rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${wrongPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
