import Elysia from 'elysia';
import { AppError } from '../shared/errors';

export const errorHandler = new Elysia({ name: 'plugin.error-handler' }).onError(
  { as: 'global' },
  ({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { message: error.message };
    }
  },
);
