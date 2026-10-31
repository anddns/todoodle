import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TASK_STATUSES = ["pending", "in_progress", "finished"] as const;

export const tasks = sqliteTable("tasks", {
	id: text()
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	title: text().notNull(),
	description: text(),
	status: text({ enum: TASK_STATUSES }).notNull().default("pending"),
	// Calendar date in YYYY-MM-DD format
	dueDate: text("due_date"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch('subsecond') * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch('subsecond') * 1000)`)
		.$onUpdate(() => new Date()),
});
