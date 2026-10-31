import {
	apiErrorSchema,
	loginSchema,
	registerSchema,
	userSchema,
} from "@todoodle/shared";
import { Elysia } from "elysia";
import { z } from "zod";
import { errorBody } from "../../shared/errors";
import {
	clearSessionCookie,
	SESSION_COOKIE,
	setSessionCookie,
} from "./auth.cookie";
import { authGuard, sessionAuth, unauthorizedResponse } from "./auth.guard";
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
		async ({ body, cookie, status }) => {
			const session = await authService.register(body);
			if (!session) return status(409, emailTaken);
			setSessionCookie(cookie, session);
			return status(201, session.user);
		},
		{
			body: registerSchema,
			response: {
				201: userSchema.describe("User registered and signed in"),
				409: apiErrorSchema.describe("Email already registered"),
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Register a user",
				description: `Creates the user and starts a session in the \`${SESSION_COOKIE}\` cookie.`,
			},
		},
	)
	.post(
		"/login",
		async ({ body, cookie, request, server, set, status }) => {
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
			setSessionCookie(cookie, session);
			return session.user;
		},
		{
			body: loginSchema,
			response: {
				200: userSchema.describe("Signed in"),
				401: apiErrorSchema.describe("Invalid email or password"),
				422: invalidRequestResponse,
				429: apiErrorSchema.describe("Too many failed login attempts"),
			},
			detail: {
				summary: "Sign in",
				description: `Starts a session in the \`${SESSION_COOKIE}\` cookie. After 5 failed attempts for the same email and IP, login is blocked for up to 15 minutes.`,
			},
		},
	)
	.post(
		"/logout",
		({ token, cookie, status }) => {
			authService.logout(token);
			clearSessionCookie(cookie);
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
				description: "Revokes the current session and clears its cookie.",
				security: sessionAuth,
			},
		},
	)
	.post(
		"/logout-all",
		({ user, cookie, status }) => {
			authService.logoutAll(user.id);
			clearSessionCookie(cookie);
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
					"Revokes all sessions of the user, including the current one.",
				security: sessionAuth,
			},
		},
	)
	.get("/me", ({ user }) => user, {
		auth: true,
		response: {
			200: userSchema.describe("Signed-in user"),
			401: unauthorizedResponse,
		},
		detail: { summary: "Get the signed-in user", security: sessionAuth },
	});
