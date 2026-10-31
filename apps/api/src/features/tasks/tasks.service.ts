import type {
	CreateTaskInput,
	ListTasksQuery,
	Task,
	UpdateTaskInput,
} from "@todoodle/shared";
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

	update(id: string, input: UpdateTaskInput): Task | null {
		const row = tasksRepository.update(id, input);
		return row ? toTask(row) : null;
	},

	delete(id: string): boolean {
		return tasksRepository.delete(id);
	},
};
