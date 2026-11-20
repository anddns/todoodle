import { cors } from '@elysia/cors';
import type { Database } from '@todoodle/database';
import Elysia from 'elysia';
import { healthRoutes } from './features/health/health.routes';
import { errorHandler } from './plugins/error-handler';
import { createRoutes } from './routes';

export function createApp(database: Database, corsOrigin: string) {
  return new Elysia()
    .use(cors({ origin: corsOrigin, credentials: true }))
    .use(errorHandler)
    .use(healthRoutes)
    .use(createRoutes(database));
}

export type App = ReturnType<typeof createApp>;
