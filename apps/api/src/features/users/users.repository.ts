import type { Paginated, PaginationQuery } from '@todoodle/contracts/pagination';
import type { UpdateUserInput } from '@todoodle/contracts/users';
import { type Database, type NewUser, type User, users } from '@todoodle/database';
import { desc, eq, lt } from 'drizzle-orm';

export class UserRepository {
  constructor(private readonly database: Database) {}

  async findMany({ limit, cursor }: PaginationQuery): Promise<Paginated<User>> {
    const rows = await this.database
      .select()
      .from(users)
      .where(cursor ? lt(users.id, cursor) : undefined)
      .orderBy(desc(users.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return { items, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null };
  }

  async findById(id: string): Promise<User | null> {
    const [result] = await this.database.select().from(users).where(eq(users.id, id)).limit(1);

    return result ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result ?? null;
  }

  async create(input: NewUser): Promise<User | null> {
    const [result] = await this.database.insert(users).values(input).returning();

    return result ?? null;
  }

  async update(
    id: string,
    input: UpdateUserInput & { passwordHash?: string | undefined },
  ): Promise<User | null> {
    const [result] = await this.database
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result ?? null;
  }

  async delete(id: string): Promise<User | null> {
    const [result] = await this.database.delete(users).where(eq(users.id, id)).returning();

    return result ?? null;
  }
}
