import { useQuery } from "@tanstack/react-query";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { ProgressDots } from "./progress-dots";

interface ExercisesHeaderProps {
  deckId: string;
  clipId: string;
}

export default function ExercisesHeader({
  deckId,
  clipId,
}: ExercisesHeaderProps) {
  const deckIndexDbRepository = new IndexedDbStorageRepository();

  const { data: deck } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => deckIndexDbRepository.getDeck(deckId),
  });

  const actualExerciseNumber =
    (deck?.clips.findIndex((c) => c.sourceFileKey === clipId) ?? -1) + 1 || 1;
  const totalExercises = deck?.clips.length ?? 0;

  return (
    <div className="flex w-full justify-between items-center mb-2">
      <h1 className="font-medium">{`Clip ${actualExerciseNumber} of ${totalExercises}`}</h1>
      <ProgressDots current={actualExerciseNumber} total={totalExercises} />
    </div>
  );
}
