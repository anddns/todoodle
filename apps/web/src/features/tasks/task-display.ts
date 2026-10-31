import type { Task, TaskStatus } from "@todoodle/shared";

export const statusLabels: Record<TaskStatus, string> = {
	pending: "Pendente",
	in_progress: "Em andamento",
	finished: "Finalizada",
};

/** Today's date as YYYY-MM-DD in the user's time zone, the format of dueDate. */
function today(): string {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task: Task): boolean {
	return (
		task.dueDate !== null &&
		task.status !== "finished" &&
		task.dueDate < today()
	);
}

const dueDateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

/** Formats a YYYY-MM-DD date, e.g. "5 de nov. de 2026". */
export function formatDueDate(dueDate: string): string {
	// With a time and no offset the date is read in local time. "2026-11-05" alone
	// is midnight UTC, which shows up as the previous day in time zones behind UTC
	return dueDateFormat.format(new Date(`${dueDate}T00:00:00`));
}
