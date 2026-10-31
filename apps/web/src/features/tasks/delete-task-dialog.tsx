import type { Task } from "@todoodle/shared";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api-error";
import { useDeleteTask } from "./tasks.queries";

export function DeleteTaskDialog({ task }: { task: Task }) {
	const [open, setOpen] = useState(false);
	const deleteTask = useDeleteTask();

	const onConfirm = () =>
		deleteTask.mutate(task.id, {
			onSuccess: () => {
				setOpen(false);
				toast.success("Tarefa excluída.");
			},
			onError: (error) =>
				toast.error(
					errorMessage(error, { NOT_FOUND: "Esta tarefa não existe mais." }),
				),
		});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Excluir "${task.title}"`}
					/>
				}
			>
				<Trash2 />
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
					<AlertDialogDescription>
						"{task.title}" será excluída permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleteTask.isPending}
						onClick={onConfirm}
					>
						{deleteTask.isPending ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
