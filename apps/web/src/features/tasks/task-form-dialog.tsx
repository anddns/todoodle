import { zodResolver } from "@hookform/resolvers/zod";
import {
	createTaskSchema,
	TASK_STATUSES,
	type Task,
	taskStatusSchema,
} from "@todoodle/shared";
import { type ReactElement, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api-error";
import { statusLabels } from "./task-display";
import { useCreateTask, useUpdateTask } from "./tasks.queries";

// Form inputs hold strings, so empty optional fields become null for the API
const taskFormSchema = z.object({
	title: createTaskSchema.shape.title,
	description: z
		.string()
		.trim()
		.transform((value) => value || null),
	status: taskStatusSchema,
	dueDate: z
		.union([z.literal(""), z.iso.date()])
		.transform((value) => value || null),
});

const statusItems = TASK_STATUSES.map((status) => ({
	value: status,
	label: statusLabels[status],
}));

/** Dialog that creates a task, or edits one when `task` is given. */
export function TaskFormDialog({
	task,
	trigger,
}: {
	task?: Task;
	trigger: ReactElement;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
				</DialogHeader>
				{/* The content unmounts when closed, so the form starts fresh each time */}
				<TaskForm task={task} onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

function TaskForm({ task, onSuccess }: { task?: Task; onSuccess: () => void }) {
	const createTask = useCreateTask();
	const updateTask = useUpdateTask();
	const mutation = task ? updateTask : createTask;

	const form = useForm({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: task?.title ?? "",
			description: task?.description ?? "",
			status: task?.status ?? "pending",
			dueDate: task?.dueDate ?? "",
		},
	});

	const onSubmit = form.handleSubmit((input) => {
		if (task) {
			updateTask.mutate(
				{ id: task.id, input },
				{
					onSuccess: () => {
						toast.success("Tarefa atualizada.");
						onSuccess();
					},
				},
			);
		} else {
			createTask.mutate(input, {
				onSuccess: () => {
					toast.success("Tarefa criada.");
					onSuccess();
				},
			});
		}
	});

	return (
		<form onSubmit={onSubmit} noValidate>
			<FieldGroup>
				{mutation.error && (
					<Alert variant="destructive">
						<AlertTitle>
							{errorMessage(mutation.error, {
								NOT_FOUND: "Esta tarefa não existe mais.",
							})}
						</AlertTitle>
					</Alert>
				)}
				<Controller
					name="title"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>Título</FieldLabel>
							<Input
								{...field}
								id={field.name}
								autoComplete="off"
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					name="description"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
							<Textarea
								{...field}
								id={field.name}
								rows={3}
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<div className="grid gap-4 sm:grid-cols-2">
					<Controller
						name="status"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Status</FieldLabel>
								<Select
									items={statusItems}
									value={field.value}
									onValueChange={(value) => value && field.onChange(value)}
								>
									<SelectTrigger
										id={field.name}
										className="w-full"
										onBlur={field.onBlur}
										aria-invalid={fieldState.invalid}
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{statusItems.map((item) => (
											<SelectItem key={item.value} value={item.value}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Controller
						name="dueDate"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Data de entrega</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type="date"
									aria-invalid={fieldState.invalid}
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>
						Cancelar
					</DialogClose>
					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? "Salvando..." : "Salvar"}
					</Button>
				</DialogFooter>
			</FieldGroup>
		</form>
	);
}
