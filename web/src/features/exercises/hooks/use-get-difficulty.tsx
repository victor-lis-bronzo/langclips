import { LocalStorageRepository } from "#/infrastructure/repositories/preferences/preferences-local-storage.repository";
import { useQuery } from "@tanstack/react-query";

type UseGetDifficultyProps = {};

export default function useGetDifficulty({}: UseGetDifficultyProps = {}) {
  const preferencesRepository = new LocalStorageRepository();

  return useQuery<"easy" | "medium" | "hard" | undefined>({
    queryKey: ["difficulty"],
    queryFn: () => preferencesRepository.getDifficulty(),
    enabled: true,
  });
}
