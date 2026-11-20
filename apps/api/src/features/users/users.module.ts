import type { Database } from '@todoodle/database';
import { BunPasswordHasher } from '../../lib/password-hasher';
import { UserController } from './users.controller';
import { UserRepository } from './users.repository';
import { createUserRoutes } from './users.routes';
import { UserService } from './users.service';

export function createUsersModule(database: Database) {
  const passwordHasher = new BunPasswordHasher();

  const repository = new UserRepository(database);
  const service = new UserService(repository, passwordHasher);
  const controller = new UserController(service);

  return createUserRoutes(controller);
}
