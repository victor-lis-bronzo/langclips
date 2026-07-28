import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { useCleanUpExistentData } from "../hooks/use-cleanup-existent-data";
import { useHasExistentDecks } from "../hooks/use-has-existent-decks";

type AlertExistentDeckDialogProps = {
	title?: string;
	description?: string;
	children?: ReactNode;
};

export function AlertExistentDeckDialog({
	title = "You already have saved decks!",
	description = "By continuing, you will view all your saved decks, or you can choose to clear all saved decks by clicking drop!",
}: AlertExistentDeckDialogProps) {
	const { data: hasDecks } = useHasExistentDecks();
	const navigate = useNavigate();
	const { mutateAsync: cleanupExistentData } = useCleanUpExistentData();

	if (!hasDecks) return null;

	async function handleCancel() {
		const success = await cleanupExistentData();
		if (success) {
			toast.success("Deck limpo com sucesso!", {
				dismissible: true,
				closeButton: true,
				position: "bottom-right",
			});
		}
	}

	async function handleConfirm() {
		navigate({
			to: "/decks",
		});
	}

	return (
		<AlertDialog open={true}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={handleCancel}
						variant={"destructive"}
						className="cursor-pointer hover:bg-red-400/80"
					>
						Drop
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} className="cursor-pointer">
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
