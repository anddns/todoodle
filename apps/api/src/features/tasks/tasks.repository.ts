import type { TaskStatus } from "@todoodle/shared";
import { desc, eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { tasks } from "./tasks.table";

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;

export const tasksRepository = {
	create(data: NewTaskRow): TaskRow {
		return db.insert(tasks).values(data).returning().get();
	},

	findAll(filters: { status?: TaskStatus }): TaskRow[] {
		return db
			.select()
			.from(tasks)
			.where(filters.status ? eq(tasks.status, filters.status) : undefined)
			.orderBy(desc(tasks.createdAt), desc(tasks.id))
			.all();
	},

	findById(id: string): TaskRow | undefined {
		return db.select().from(tasks).where(eq(tasks.id, id)).get();
	},

	update(id: string, data: Partial<NewTaskRow>): TaskRow | undefined {
		return db.update(tasks).set(data).where(eq(tasks.id, id)).returning().get();
	},

	delete(id: string): boolean {
		const deleted = db
			.delete(tasks)
			.where(eq(tasks.id, id))
			.returning({ id: tasks.id })
			.get();
		return deleted !== undefined;
	},
};
