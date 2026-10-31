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
};
