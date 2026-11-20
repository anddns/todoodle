import { paginationQuerySchema } from '@todoodle/contracts/pagination';
import {
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  userListSchema,
} from '@todoodle/contracts/users';
import Elysia from 'elysia';
import type { UserController } from './users.controller';
import { userParamsSchema } from './users.schema';

export function createUserRoutes(controller: UserController) {
  return new Elysia({ prefix: '/users', name: 'routes.users' })
    .post('/', ({ body }) => controller.create(body), {
      body: createUserSchema,
    })
    .get('/', ({ query }) => controller.list(query), {
      query: paginationQuerySchema,
      response: { 200: userListSchema },
    })
    .get('/:id', ({ params }) => controller.getById(params.id), {
      params: userParamsSchema,
    })
    .patch('/:id', ({ params, body }) => controller.update(params.id, body), {
      params: userParamsSchema,
      body: updateUserSchema,
    })
    .patch('/:id/password', ({ params, body }) => controller.changePassword(params.id, body), {
      params: userParamsSchema,
      body: changePasswordSchema,
    })
    .delete('/:id', ({ params }) => controller.delete(params.id), {
      params: userParamsSchema,
    });
}
