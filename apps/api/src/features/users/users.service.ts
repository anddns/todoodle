import type { Paginated, PaginationQuery } from '@todoodle/contracts/pagination';
import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
} from '@todoodle/contracts/users';
import type { User } from '@todoodle/database';
import type { PasswordHasher } from '../../lib/password-hasher';
import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors';
import type { UserRepository } from './users.repository';

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async list(query: PaginationQuery): Promise<Paginated<User>> {
    return this.repository.findMany(query);
  }

  async getById(id: string): Promise<User> {
    const result = await this.repository.findById(id);

    if (!result) throw new NotFoundError('User not found');

    return result;
  }

  async create(input: CreateUserInput): Promise<User> {
    const alreadyExists = await this.repository.findByEmail(input.email);

    if (alreadyExists) throw new ConflictError('User already exists');

    const { password, ...rest } = input;
    const passwordHash = await this.passwordHasher.hash(password);

    const result = await this.repository.create({ ...rest, passwordHash });

    if (!result) throw new DatabaseError('User creation failed');

    return result;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const currentUser = await this.repository.findById(id);

    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    if (input.email !== undefined && input.email !== currentUser.email) {
      const emailOwner = await this.repository.findByEmail(input.email);

      if (emailOwner) throw new ConflictError('Email already in use');
    }

    if (input.role) {
      throw new ForbiddenError('Restricted field modification');
    }

    const result = await this.repository.update(id, { ...input });

    if (!result) throw new DatabaseError('User update failed');

    return result;
  }

  async changePassword(id: string, input: ChangePasswordInput): Promise<void> {
    const currentUser = await this.repository.findById(id);

    if (!currentUser) throw new NotFoundError('User not found');

    const isMatch = await this.passwordHasher.verify(
      input.currentPassword,
      currentUser.passwordHash,
    );

    if (!isMatch) throw new UnauthorizedError('Invalid credentials');

    const passwordHash = await this.passwordHasher.hash(input.newPassword);

    const result = await this.repository.update(id, { passwordHash });

    if (!result) throw new DatabaseError('Credentials update failed');
  }

  async delete(id: string): Promise<User> {
    const result = await this.repository.delete(id);

    if (!result) throw new NotFoundError('User not found');

    return result;
  }
}
