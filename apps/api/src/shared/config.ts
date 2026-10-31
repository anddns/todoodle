export const config = {
	port: Number(Bun.env.PORT ?? 3000),
	dbFileName: Bun.env.DB_FILE_NAME ?? "todoodle.db",
};
