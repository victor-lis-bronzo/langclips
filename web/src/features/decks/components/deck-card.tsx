import { useNavigate } from "@tanstack/react-router";
import { Film, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import type { DeckRecord } from "#/infrastructure/database/indexed-db.types";
import { IndexedDbClipRepository } from "#/infrastructure/repositories/clip/clip-indexed-db.repository";
import { IndexedDbStorageRepository } from "#/infrastructure/repositories/deck/deck-indexed-db.repository";
import { useDeleteDeck } from "../hooks/use-delete-deck";
import { captureThumbnailFromBlob } from "#/features/processing/utils/capture-thumbnail";

interface DeckCardProps {
	deck: DeckRecord;
}

const clipRepository = new IndexedDbClipRepository();
const deckRepository = new IndexedDbStorageRepository();

export function DeckCard({ deck }: DeckCardProps) {
	const navigate = useNavigate();
	const { mutate: deleteDeck, isPending: isDeleting } = useDeleteDeck();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [autoThumbnailBlob, setAutoThumbnailBlob] = useState<Blob | undefined>(
		deck.thumbnailBlob,
	);

	useEffect(() => {
		setAutoThumbnailBlob(deck.thumbnailBlob);

		if (!deck.thumbnailBlob && deck.clips && deck.clips.length > 0) {
			const firstClipId = deck.clips[0].id;
			let isMounted = true;

			clipRepository.getClipBlobById(firstClipId).then(async (blob) => {
				if (!blob || !isMounted) return;
				const thumb = await captureThumbnailFromBlob(blob);
				if (thumb && isMounted) {
					setAutoThumbnailBlob(thumb);
					await deckRepository.saveDeck({
						...deck,
						thumbnailBlob: thumb,
					});
				}
			});

			return () => {
				isMounted = false;
			};
		}
	}, [deck]);

	const currentThumbnailBlob = deck.thumbnailBlob || autoThumbnailBlob;

	const thumbnailUrl = useMemo(() => {
		if (!currentThumbnailBlob) return null;
		return URL.createObjectURL(currentThumbnailBlob);
	}, [currentThumbnailBlob]);

	useEffect(() => {
		return () => {
			if (thumbnailUrl) {
				URL.revokeObjectURL(thumbnailUrl);
			}
		};
	}, [thumbnailUrl]);

	const clipsCount = deck.clips?.length ?? 0;
	const totalSeconds = Math.round(deck.totalSeconds ?? 0);
	const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
	const seconds = String(totalSeconds % 60).padStart(2, "0");

	const durationText =
		totalSeconds < 60 ? `~${totalSeconds}s` : `~${minutes}m ${seconds}s`;

	const formattedDate = new Date(deck.createdAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	const handleCardClick = () => {
		navigate({
			to: "/difficulty/$deckId",
			params: { deckId: deck.id },
		});
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteDeck(deck.id);
		setConfirmOpen(false);
	};

	return (
		<div
			onClick={handleCardClick}
			className="group flex flex-col rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer relative"
		>
			{/* Thumbnail Container */}
			<div className="w-full h-44 bg-zinc-950 relative overflow-hidden flex items-center justify-center border-b border-white/5">
				{thumbnailUrl ? (
					<img
						src={thumbnailUrl}
						alt="Deck thumbnail"
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="flex flex-col items-center justify-center text-zinc-600 group-hover:text-emerald-400/80 transition-colors">
						<Film className="w-12 h-12 mb-1 opacity-70" />
						<span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
							No Frame Preview
						</span>
					</div>
				)}

				<div className="absolute top-3 right-3 z-10">
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<AlertDialogTrigger asChild>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setConfirmOpen(true);
								}}
								disabled={isDeleting}
								className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all cursor-pointer"
								title="Delete deck"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</AlertDialogTrigger>
						<AlertDialogContent onClick={(e) => e.stopPropagation()}>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Deck</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this deck? This action will
									remove all clips and saved exercise history for this deck.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel onClick={(e) => e.stopPropagation()}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									className="bg-red-600 hover:bg-red-700 text-white"
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{/* Info Footer */}
			<div className="p-4 flex flex-col gap-3 bg-zinc-900/80 backdrop-blur-sm">
				<div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
					<span>{formattedDate}</span>
				</div>

				<div className="flex items-center justify-between pt-1 border-t border-white/5">
					<span className="font-semibold text-white text-base">
						{clipsCount} {clipsCount === 1 ? "clip" : "clips"}
					</span>
					<span className="font-mono text-emerald-400 font-medium text-sm">
						{durationText}
					</span>
				</div>
			</div>
		</div>
	);
}
