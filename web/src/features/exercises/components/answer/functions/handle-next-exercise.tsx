import type { useNavigate } from "@tanstack/react-router";

type NavigateType = ReturnType<typeof useNavigate>;

export function handleNextExercise(
	nextClip: { deckId: string; id: string } | null | undefined,
	navigate: NavigateType,
) {
	if (!nextClip) {
		return; // TODO: create "Deck Finished" page
	}
	navigate({
		to: "/exercises/$deckId/$clipId",
		params: {
			deckId: nextClip.deckId,
			clipId: nextClip.id,
		},
	});
}
