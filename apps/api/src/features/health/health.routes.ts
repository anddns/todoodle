import { type HealthResponse, healthResponseSchema } from '@todoodle/contracts/health';
import Elysia from 'elysia';

export const healthRoutes = new Elysia({ name: 'health', prefix: '/health' }).get(
  '/',
  (): HealthResponse => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
  {
    response: {
      200: healthResponseSchema,
    },
    detail: {
      summary: 'Liveness check',
      tags: ['Health'],
    },
  },
);
