import * as z from 'zod';

export const userParamsSchema = z.object({
  id: z.uuidv7(),
});
