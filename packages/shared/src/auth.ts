import { z } from "zod";

// Normalized so the same address always maps to the same account
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const userSchema = z.object({
	id: z.uuid({ version: "v7" }),
	email: z.email(),
	createdAt: z.iso.datetime(),
});

export const registerSchema = z.object({
	email: emailSchema,
	password: z.string().min(8).max(128),
});

// Login does not repeat the password rules, so it never reveals them
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1).max(128),
});

export const authSessionSchema = z.object({
	token: z.string(),
	expiresAt: z.iso.datetime(),
	user: userSchema,
});

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
