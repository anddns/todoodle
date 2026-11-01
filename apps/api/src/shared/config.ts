export const config = {
	port: Number(Bun.env.PORT ?? 3000),
	// A local file in development, the Turso database URL (libsql://...) in production
	databaseUrl: Bun.env.DATABASE_URL ?? "file:todoodle.db",
	databaseAuthToken: Bun.env.DATABASE_AUTH_TOKEN,
	isProduction: Bun.env.NODE_ENV === "production",
};
