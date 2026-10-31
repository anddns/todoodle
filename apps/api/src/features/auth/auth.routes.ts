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
import { loginAttempts } from "./login-attempts";

const emailTaken = errorBody("CONFLICT", "Email already registered");
const invalidCredentials = errorBody(
	"UNAUTHORIZED",
	"Invalid email or password",
);
const tooManyAttempts = errorBody(
	"TOO_MANY_REQUESTS",
	"Too many failed login attempts, try again later",
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
		async ({ body, request, server, set, status }) => {
			const ip = server?.requestIP(request)?.address ?? "unknown";
			const attemptsKey = `${ip}:${body.email}`;

			const retryAfter = loginAttempts.retryAfter(attemptsKey);
			if (retryAfter !== null) {
				set.headers["retry-after"] = String(retryAfter);
				return status(429, tooManyAttempts);
			}

			const session = await authService.login(body);
			if (!session) {
				loginAttempts.recordFailure(attemptsKey);
				return status(401, invalidCredentials);
			}
			loginAttempts.reset(attemptsKey);
			return session;
		},
		{
			body: loginSchema,
			response: {
				200: authSessionSchema.describe("Signed in"),
				401: apiErrorSchema.describe("Invalid email or password"),
				422: invalidRequestResponse,
				429: apiErrorSchema.describe("Too many failed login attempts"),
			},
			detail: {
				summary: "Sign in",
				description:
					"Returns a session token to send as `Authorization: Bearer <token>`. After 5 failed attempts for the same email and IP, login is blocked for up to 15 minutes.",
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
	.post(
		"/logout-all",
		({ user, status }) => {
			authService.logoutAll(user.id);
			return status(204, undefined);
		},
		{
			auth: true,
			response: {
				204: z.null().optional().describe("Signed out of all sessions"),
				401: unauthorizedResponse,
			},
			detail: {
				summary: "Sign out everywhere",
				description:
					"Revokes all session tokens of the user, including the one used in the request.",
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
