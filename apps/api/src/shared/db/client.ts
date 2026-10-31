import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { config } from "../config";

const sqlite = new Database(config.dbFileName);
// SQLite ignores foreign keys unless enabled on each connection
sqlite.run("PRAGMA foreign_keys = ON");

export const db = drizzle({ client: sqlite });
