import * as z from 'zod';

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.uuidv7().optional(),
});

export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.uuidv7().nullable(),
  });
}

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type Paginated<T> = { items: T[]; nextCursor: string | null };
