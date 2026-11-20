import * as z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.literal(['development', 'test', 'production']).default('development'),
  WEB_URL: z.url(),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const parsedEnvSchema = envSchema.safeParse(process.env);

if (!parsedEnvSchema.success) {
  console.error(`Invalid environment variables:\n ${z.prettifyError(parsedEnvSchema.error)}`);
  process.exit(1);
}

export const env = parsedEnvSchema.data;
