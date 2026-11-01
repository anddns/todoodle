import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config";

const client = createClient({
	url: config.databaseUrl,
	authToken: config.databaseAuthToken,
});
// SQLite ignores foreign keys unless enabled on each connection
await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle({ client });
