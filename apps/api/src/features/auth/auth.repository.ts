import { eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { sessions, users } from "./auth.table";

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;

export const authRepository = {
	createUser(data: NewUserRow): UserRow {
		return db.insert(users).values(data).returning().get();
	},

	findUserByEmail(email: string): UserRow | undefined {
		return db.select().from(users).where(eq(users.email, email)).get();
	},

	createSession(data: NewSessionRow): SessionRow {
		return db.insert(sessions).values(data).returning().get();
	},

	findSessionWithUser(
		id: string,
	): { session: SessionRow; user: UserRow } | undefined {
		return db
			.select({ session: sessions, user: users })
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, id))
			.get();
	},

	deleteSession(id: string): void {
		db.delete(sessions).where(eq(sessions.id, id)).run();
	},
};
