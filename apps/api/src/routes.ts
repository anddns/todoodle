import type { Database } from '@todoodle/database';
import Elysia from 'elysia';
import { createUsersModule } from './features/users/users.module';

export function createRoutes(database: Database) {
  return new Elysia({ prefix: 'api/v1', name: 'routes' }).use(createUsersModule(database));
}
