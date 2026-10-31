const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// In memory, which is enough while the API runs as a single process
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

// Drops expired entries so the map does not grow forever
setInterval(() => {
	const now = Date.now();
	for (const [key, attempts] of failedAttempts) {
		if (attempts.resetAt <= now) failedAttempts.delete(key);
	}
}, WINDOW_MS).unref();

/** Limits failed logins per key (client IP + email) within a time window. */
export const loginAttempts = {
	/** Returns the seconds until the key can try again, or null when it is not blocked. */
	retryAfter(key: string): number | null {
		const attempts = failedAttempts.get(key);
		if (!attempts || attempts.resetAt <= Date.now()) return null;
		if (attempts.count < MAX_FAILED_ATTEMPTS) return null;
		return Math.ceil((attempts.resetAt - Date.now()) / 1000);
	},

	recordFailure(key: string): void {
		const attempts = failedAttempts.get(key);
		if (attempts && attempts.resetAt > Date.now()) {
			attempts.count++;
		} else {
			failedAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
		}
	},

	reset(key: string): void {
		failedAttempts.delete(key);
	},
};
