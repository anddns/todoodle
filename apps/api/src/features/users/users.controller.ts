import type { Paginated, PaginationQuery } from '@todoodle/contracts/pagination';
import type {
  ChangePasswordInput,
  CreateUserInput,
  PublicUser,
  UpdateUserInput,
} from '@todoodle/contracts/users';
import { toPublicUser } from './users.mapper';
import type { UserService } from './users.service';

export class UserController {
  constructor(private readonly service: UserService) {}

  async list(query: PaginationQuery): Promise<Paginated<PublicUser>> {
    const { items, nextCursor } = await this.service.list(query);
    return { items: items.map(toPublicUser), nextCursor };
  }

  async getById(id: string): Promise<PublicUser> {
    return toPublicUser(await this.service.getById(id));
  }

  async create(input: CreateUserInput): Promise<PublicUser> {
    return toPublicUser(await this.service.create(input));
  }

  async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    return toPublicUser(await this.service.update(id, input));
  }

  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    await this.service.changePassword(id, input);
  }

  async delete(id: string): Promise<PublicUser> {
    return toPublicUser(await this.service.delete(id));
  }
}
