import { eq } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { sessions, users } from "./auth.table";

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;

export const authRepository = {
	async createUser(data: NewUserRow): Promise<UserRow> {
		return db.insert(users).values(data).returning().get();
	},

	async findUserByEmail(email: string): Promise<UserRow | undefined> {
		return db.select().from(users).where(eq(users.email, email)).get();
	},

	async createSession(data: NewSessionRow): Promise<SessionRow> {
		return db.insert(sessions).values(data).returning().get();
	},

	async findSessionWithUser(
		id: string,
	): Promise<{ session: SessionRow; user: UserRow } | undefined> {
		return db
			.select({ session: sessions, user: users })
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, id))
			.get();
	},

	async deleteSession(id: string): Promise<void> {
		await db.delete(sessions).where(eq(sessions.id, id)).run();
	},

	async deleteUserSessions(userId: string): Promise<void> {
		await db.delete(sessions).where(eq(sessions.userId, userId)).run();
	},
};
