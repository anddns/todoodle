import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text()
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7()),
	email: text().notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch('subsecond') * 1000)`),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.default(sql`(unixepoch('subsecond') * 1000)`)
		.$onUpdate(() => new Date()),
});

export const sessions = sqliteTable(
	"sessions",
	{
		// SHA-256 hash of the token, so a leaked database does not expose valid tokens
		id: text().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch('subsecond') * 1000)`),
	},
	(table) => [index("sessions_user_id_idx").on(table.userId)],
);
