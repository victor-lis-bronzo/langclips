import { type ReactNode } from "react";
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
import { useVerifyExistentDecks } from "../hooks/use-verify-decks";
import { useCleanUpExistentData } from "../hooks/use-cleanup-existent-data";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type AlertExistentDeckDialogProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function AlertExistentDeckDialog({
  title = "You already have a saved deck!",
  description = "By continuing, you will go to the existing deck, or you can choose to delete the existing deck by clicking cancel!",
}: AlertExistentDeckDialogProps) {
  const { data: existentDeck } = useVerifyExistentDecks();
  const navigate = useNavigate();
  const { mutateAsync: cleanupExistentData } = useCleanUpExistentData();

  if (!existentDeck) return null;

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
      to: "/difficulty/$deckId",
      params: {
        deckId: existentDeck!.id,
      },
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
