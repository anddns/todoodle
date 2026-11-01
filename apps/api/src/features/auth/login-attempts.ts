import { eq, lte, sql } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { loginAttempts as attemptsTable } from "./auth.table";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/** Limits failed logins per key (client IP + email) within a time window. */
export const loginAttempts = {
	/** Returns the seconds until the key can try again, or null when it is not blocked. */
	async retryAfter(key: string): Promise<number | null> {
		const attempts = await db
			.select()
			.from(attemptsTable)
			.where(eq(attemptsTable.key, key))
			.get();
		if (!attempts || attempts.resetAt.getTime() <= Date.now()) return null;
		if (attempts.count < MAX_FAILED_ATTEMPTS) return null;
		return Math.ceil((attempts.resetAt.getTime() - Date.now()) / 1000);
	},

	async recordFailure(key: string): Promise<void> {
		const now = new Date();
		// Drops expired entries so the table does not grow forever
		await db.delete(attemptsTable).where(lte(attemptsTable.resetAt, now));
		// A single upsert, so concurrent failures cannot overwrite each other's count
		await db
			.insert(attemptsTable)
			.values({
				key,
				count: 1,
				resetAt: new Date(now.getTime() + WINDOW_MS),
			})
			.onConflictDoUpdate({
				target: attemptsTable.key,
				set: { count: sql`${attemptsTable.count} + 1` },
			});
	},

	async reset(key: string): Promise<void> {
		await db.delete(attemptsTable).where(eq(attemptsTable.key, key));
	},
};
