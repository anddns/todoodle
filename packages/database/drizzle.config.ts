import { defineConfig } from 'drizzle-kit';
import * as z from 'zod';

const schema = z.object({
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: 'DATABASE_URL must be a valid postgres:// or postgresql:// URL',
  }),
});

const parsedSchema = schema.safeParse(process.env);

if (!parsedSchema.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(parsedSchema.error)}`);
  process.exit(1);
}

export default defineConfig({
  out: './src/migrations',
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  dbCredentials: {
    url: parsedSchema.data.DATABASE_URL,
  },
  migrations: {
    table: 'migrations',
    schema: 'drizzle',
  },
});
