import type {
	CreateTaskInput,
	ListTasksQuery,
	Task,
	UpdateTaskInput,
} from "@todoodle/shared";
import { type TaskRow, tasksRepository } from "./tasks.repository";

function toTask({ userId: _userId, ...row }: TaskRow): Task {
	return {
		...row,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

export const tasksService = {
	create(userId: string, input: CreateTaskInput): Task {
		return toTask(tasksRepository.create({ ...input, userId }));
	},

	list(userId: string, query: ListTasksQuery): Task[] {
		return tasksRepository.findAll(userId, query).map(toTask);
	},

	getById(userId: string, id: string): Task | null {
		const row = tasksRepository.findById(userId, id);
		return row ? toTask(row) : null;
	},

	update(userId: string, id: string, input: UpdateTaskInput): Task | null {
		const row = tasksRepository.update(userId, id, input);
		return row ? toTask(row) : null;
	},

	delete(userId: string, id: string): boolean {
		return tasksRepository.delete(userId, id);
	},
};
