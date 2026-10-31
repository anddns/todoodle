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
	create(data: NewTaskRow): TaskRow {
		return db.insert(tasks).values(data).returning().get();
	},

	findAll(userId: string, filters: { status?: TaskStatus }): TaskRow[] {
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

	findById(userId: string, id: string): TaskRow | undefined {
		return db.select().from(tasks).where(ownTask(userId, id)).get();
	},

	update(
		userId: string,
		id: string,
		data: Partial<NewTaskRow>,
	): TaskRow | undefined {
		return db
			.update(tasks)
			.set(data)
			.where(ownTask(userId, id))
			.returning()
			.get();
	},

	delete(userId: string, id: string): boolean {
		const deleted = db
			.delete(tasks)
			.where(ownTask(userId, id))
			.returning({ id: tasks.id })
			.get();
		return deleted !== undefined;
	},
};
