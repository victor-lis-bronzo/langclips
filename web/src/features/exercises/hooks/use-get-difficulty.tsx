import { useQuery } from "@tanstack/react-query";
import { LocalStorageRepository } from "#/infrastructure/repositories/preferences/preferences-local-storage.repository";

const preferencesRepository = new LocalStorageRepository();

export default function useGetDifficulty() {
	return useQuery<"easy" | "medium" | "hard" | undefined>({
		queryKey: ["difficulty"],
		queryFn: () => preferencesRepository.getDifficulty(),
		enabled: true,
	});
}
