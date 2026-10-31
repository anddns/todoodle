import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	TASK_STATUSES,
	type TaskStatus,
	taskStatusSchema,
} from "@todoodle/shared";
import { ListTodo, Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	statusLabels,
	TaskFormDialog,
	TaskItem,
	tasksQueryOptions,
} from "@/features/tasks";

const ALL = "all";
const FILTERS = [ALL, ...TASK_STATUSES] as const;

const filterLabels: Record<TaskStatus | typeof ALL, string> = {
	[ALL]: "Todas",
	pending: "Pendentes",
	in_progress: "Em andamento",
	finished: "Finalizadas",
};

export const Route = createFileRoute("/_authenticated/")({
	validateSearch: z.object({
		// An unknown status in the URL falls back to showing every task
		status: taskStatusSchema.optional().catch(undefined),
	}),
	loaderDeps: ({ search }) => ({ status: search.status }),
	loader: ({ context, deps }) =>
		context.queryClient.ensureQueryData(tasksQueryOptions(deps.status)),
	head: () => ({ meta: [{ title: "Tarefas · Todoodle" }] }),
	component: TasksPage,
});

function TasksPage() {
	const { status } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { data: tasks } = useSuspenseQuery(tasksQueryOptions(status));
	const filter = status ?? ALL;

	return (
		<section className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-heading text-2xl font-semibold">Tarefas</h1>
				<TaskFormDialog
					trigger={
						<Button>
							<Plus data-icon="inline-start" />
							Nova tarefa
						</Button>
					}
				/>
			</div>
			<Tabs
				value={filter}
				onValueChange={(value) =>
					navigate({
						search: { status: taskStatusSchema.safeParse(value).data },
					})
				}
			>
				<TabsList className="w-full sm:w-fit">
					{FILTERS.map((value) => (
						<TabsTrigger
							key={value}
							value={value}
							className="px-2 text-xs sm:px-3 sm:text-sm"
						>
							{filterLabels[value]}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value={filter} className="pt-4">
					{tasks.length > 0 ? (
						<ul className="flex flex-col gap-3">
							{tasks.map((task) => (
								<TaskItem key={task.id} task={task} />
							))}
						</ul>
					) : (
						<EmptyTasks status={status} />
					)}
				</TabsContent>
			</Tabs>
		</section>
	);
}

function EmptyTasks({ status }: { status?: TaskStatus }) {
	return (
		<Empty className="border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<ListTodo />
				</EmptyMedia>
				<EmptyTitle>
					{status ? "Nenhuma tarefa aqui" : "Nenhuma tarefa ainda"}
				</EmptyTitle>
				<EmptyDescription>
					{status
						? `Você não tem tarefas com o status "${statusLabels[status]}".`
						: "Crie a sua primeira tarefa para começar."}
				</EmptyDescription>
			</EmptyHeader>
			{!status && (
				<EmptyContent>
					<TaskFormDialog
						trigger={
							<Button variant="outline">
								<Plus data-icon="inline-start" />
								Nova tarefa
							</Button>
						}
					/>
				</EmptyContent>
			)}
		</Empty>
	);
}
