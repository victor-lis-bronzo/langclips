import { LocalStorageRepository } from "#/infrastructure/repositories/preferences/preferences-local-storage.repository";
import { useQuery } from "@tanstack/react-query";

type UseGetDifficultyProps = {};

const preferencesRepository = new LocalStorageRepository();

export default function useGetDifficulty({}: UseGetDifficultyProps = {}) {
	return useQuery<"easy" | "medium" | "hard" | undefined>({
		queryKey: ["difficulty"],
		queryFn: () => preferencesRepository.getDifficulty(),
		enabled: true,
	});
}
