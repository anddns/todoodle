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
	async create(userId: string, input: CreateTaskInput): Promise<Task> {
		return toTask(await tasksRepository.create({ ...input, userId }));
	},

	async list(userId: string, query: ListTasksQuery): Promise<Task[]> {
		return (await tasksRepository.findAll(userId, query)).map(toTask);
	},

	async getById(userId: string, id: string): Promise<Task | null> {
		const row = await tasksRepository.findById(userId, id);
		return row ? toTask(row) : null;
	},

	async update(
		userId: string,
		id: string,
		input: UpdateTaskInput,
	): Promise<Task | null> {
		const row = await tasksRepository.update(userId, id, input);
		return row ? toTask(row) : null;
	},

	delete(userId: string, id: string): Promise<boolean> {
		return tasksRepository.delete(userId, id);
	},
};
