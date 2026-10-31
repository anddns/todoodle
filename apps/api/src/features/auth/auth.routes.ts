import {
	apiErrorSchema,
	authSessionSchema,
	loginSchema,
	registerSchema,
	userSchema,
} from "@todoodle/shared";
import { Elysia } from "elysia";
import { z } from "zod";
import { errorBody } from "../../shared/errors";
import { authGuard, bearerAuth, unauthorizedResponse } from "./auth.guard";
import { authService } from "./auth.service";

const emailTaken = errorBody("CONFLICT", "Email already registered");
const invalidCredentials = errorBody(
	"UNAUTHORIZED",
	"Invalid email or password",
);

const invalidRequestResponse = apiErrorSchema.describe("Invalid request");

export const authRoutes = new Elysia({
	prefix: "/auth",
	detail: { tags: ["Auth"] },
})
	.use(authGuard)
	.post(
		"/register",
		async ({ body, status }) => {
			const session = await authService.register(body);
			return session ? status(201, session) : status(409, emailTaken);
		},
		{
			body: registerSchema,
			response: {
				201: authSessionSchema.describe("User registered and signed in"),
				409: apiErrorSchema.describe("Email already registered"),
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Register a user",
				description: "Creates the user and returns a session token.",
			},
		},
	)
	.post(
		"/login",
		async ({ body, status }) =>
			(await authService.login(body)) ?? status(401, invalidCredentials),
		{
			body: loginSchema,
			response: {
				200: authSessionSchema.describe("Signed in"),
				401: apiErrorSchema.describe("Invalid email or password"),
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Sign in",
				description:
					"Returns a session token to send as `Authorization: Bearer <token>`.",
			},
		},
	)
	.post(
		"/logout",
		({ token, status }) => {
			authService.logout(token);
			return status(204, undefined);
		},
		{
			auth: true,
			response: {
				204: z.null().optional().describe("Signed out"),
				401: unauthorizedResponse,
			},
			detail: {
				summary: "Sign out",
				description: "Revokes the session token used in the request.",
				security: bearerAuth,
			},
		},
	)
	.get("/me", ({ user }) => user, {
		auth: true,
		response: {
			200: userSchema.describe("Signed-in user"),
			401: unauthorizedResponse,
		},
		detail: { summary: "Get the signed-in user", security: bearerAuth },
	});
