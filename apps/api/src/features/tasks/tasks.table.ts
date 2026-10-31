import { TASK_STATUSES } from "@todoodle/shared";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// Tables import each other directly: drizzle-kit loads table files on their own,
// and going through the feature index would pull in routes, services and the db
import { users } from "../auth/auth.table";

export const tasks = sqliteTable(
	"tasks",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => Bun.randomUUIDv7()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
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
	},
	(table) => [index("tasks_user_id_idx").on(table.userId)],
);
