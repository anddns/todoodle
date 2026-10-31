import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
	head: () => ({ meta: [{ title: "Tarefas · Todoodle" }] }),
	component: TasksPage,
});

function TasksPage() {
	return (
		<section className="flex flex-col gap-2">
			<h1 className="font-heading text-2xl font-semibold">Tarefas</h1>
			<p className="text-muted-foreground">Suas tarefas vão aparecer aqui.</p>
		</section>
	);
}
