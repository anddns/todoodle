import type { CreateTaskInput, ListTasksQuery, Task } from "@todoodle/shared";
import { type TaskRow, tasksRepository } from "./tasks.repository";

function toTask(row: TaskRow): Task {
	return {
		...row,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export const tasksService = {
	create(input: CreateTaskInput): Task {
		return toTask(tasksRepository.create(input));
	},

	list(query: ListTasksQuery): Task[] {
		return tasksRepository.findAll(query).map(toTask);
	},

	getById(id: string): Task | null {
		const row = tasksRepository.findById(id);
		return row ? toTask(row) : null;
	},
};
