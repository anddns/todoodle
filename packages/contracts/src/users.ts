import * as z from 'zod';
import { paginatedSchema } from './pagination';

const email = z.string().trim().toLowerCase().min(6).max(64).pipe(z.email());
const password = z.string().min(8).max(64);
const userRole = z.literal(['admin', 'user']);

export const publicUserSchema = z.object({
  id: z.uuidv7(),
  email: email,
  role: userRole,
  emailVerified: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const userListSchema = paginatedSchema(publicUserSchema);

export const createUserSchema = z.object({
  email: email,
  password: password,
  role: userRole.optional(),
});

export const updateUserSchema = z
  .strictObject({
    email: email.optional(),
    role: userRole.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: 'At least one of the properties must be provided.',
  });

export const changePasswordSchema = z
  .strictObject({
    currentPassword: z.string().min(8).max(64),
    newPassword: password,
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: 'The new password must be different from the old password',
    path: ['newPassword'],
  });

export type PublicUser = z.infer<typeof publicUserSchema>;
export type UserList = z.infer<typeof userListSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
