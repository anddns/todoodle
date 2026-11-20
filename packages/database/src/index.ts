import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { relations } from './relations';

export const createDatabase = (url: string) => {
  const client = postgres(url);
  return drizzle({ client, relations });
};

export type Database = ReturnType<typeof createDatabase>;

export * from './schema';
