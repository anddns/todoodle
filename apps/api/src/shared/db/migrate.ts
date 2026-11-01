import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./client";

// Resolved from this file, so the script works from any working directory
await migrate(db, {
	migrationsFolder: `${import.meta.dirname}/../../../drizzle`,
});

console.log("Migrations applied");
