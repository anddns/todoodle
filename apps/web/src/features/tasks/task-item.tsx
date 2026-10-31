import type { Task } from "@todoodle/shared";
import { CalendarDays, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { errorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { formatDueDate, isOverdue, statusLabels } from "./task-display";
import { TaskFormDialog } from "./task-form-dialog";
import { useUpdateTask } from "./tasks.queries";

export function TaskItem({ task }: { task: Task }) {
	const updateTask = useUpdateTask();
	const finished = task.status === "finished";
	const overdue = isOverdue(task);

	// Unchecking a finished task sends it back to pending
	const toggleFinished = (checked: boolean) =>
		updateTask.mutate(
			{ id: task.id, input: { status: checked ? "finished" : "pending" } },
			{
				onError: (error) =>
					toast.error(
						errorMessage(error, { NOT_FOUND: "Esta tarefa não existe mais." }),
					),
			},
		);

	return (
		<li className="flex items-start gap-3 rounded-2xl border p-4">
			<Checkbox
				className="mt-0.5"
				checked={finished}
				disabled={updateTask.isPending}
				onCheckedChange={toggleFinished}
				aria-label={
					finished ? `Reabrir "${task.title}"` : `Finalizar "${task.title}"`
				}
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<p
					className={cn(
						"font-medium break-words",
						finished && "text-muted-foreground line-through",
					)}
				>
					{task.title}
				</p>
				{task.description && (
					<p className="text-sm whitespace-pre-line break-words text-muted-foreground">
						{task.description}
					</p>
				)}
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<Badge variant={finished ? "secondary" : "outline"}>
						{statusLabels[task.status]}
					</Badge>
					{task.dueDate && (
						<span
							className={cn(
								"flex items-center gap-1",
								overdue && "font-medium text-destructive",
							)}
						>
							<CalendarDays className="size-3.5" />
							{formatDueDate(task.dueDate)}
							{overdue && " · Atrasada"}
						</span>
					)}
				</div>
			</div>
			<div className="flex shrink-0 gap-1">
				<TaskFormDialog
					task={task}
					trigger={
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Editar "${task.title}"`}
						>
							<Pencil />
						</Button>
					}
				/>
				<DeleteTaskDialog task={task} />
			</div>
		</li>
	);
}
