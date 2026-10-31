import { db } from "../../shared/db/client";
import { tasks } from "./tasks.table";

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;

export const tasksRepository = {
	create(data: NewTaskRow): TaskRow {
		return db.insert(tasks).values(data).returning().get();
	},
};
