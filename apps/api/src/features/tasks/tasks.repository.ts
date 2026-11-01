import type { TaskStatus } from "@todoodle/shared";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { tasks } from "./tasks.table";

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;

// Every query is scoped to the owner, so a user never reaches another user's tasks
function ownTask(userId: string, id: string) {
	return and(eq(tasks.userId, userId), eq(tasks.id, id));
}

export const tasksRepository = {
	async create(data: NewTaskRow): Promise<TaskRow> {
		return db.insert(tasks).values(data).returning().get();
	},

	async findAll(
		userId: string,
		filters: { status?: TaskStatus },
	): Promise<TaskRow[]> {
		return db
			.select()
			.from(tasks)
			.where(
				and(
					eq(tasks.userId, userId),
					filters.status ? eq(tasks.status, filters.status) : undefined,
				),
			)
			.orderBy(desc(tasks.createdAt), desc(tasks.id))
			.all();
	},

	async findById(userId: string, id: string): Promise<TaskRow | undefined> {
		return db.select().from(tasks).where(ownTask(userId, id)).get();
	},

	async update(
		userId: string,
		id: string,
		data: Partial<NewTaskRow>,
	): Promise<TaskRow | undefined> {
		return db
			.update(tasks)
			.set(data)
			.where(ownTask(userId, id))
			.returning()
			.get();
	},

	async delete(userId: string, id: string): Promise<boolean> {
		const deleted = await db
			.delete(tasks)
			.where(ownTask(userId, id))
			.returning({ id: tasks.id })
			.get();
		return deleted !== undefined;
	},
};
