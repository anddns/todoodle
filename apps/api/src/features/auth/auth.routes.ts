import {
	apiErrorSchema,
	loginSchema,
	registerSchema,
	userSchema,
} from "@todoodle/shared";
import type { Server } from "bun";
import { Elysia } from "elysia";
import { z } from "zod";
import { config } from "../../shared/config";
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

/** The visitor's IP, used to key the failed login limit. */
function clientIp(
	request: Request,
	server: Server<unknown> | null,
): string | undefined {
	// Behind Vercel the socket belongs to its proxy. Vercel overwrites x-real-ip with
	// the visitor's IP, so the header can only be trusted there
	if (config.onVercel) return request.headers.get("x-real-ip") ?? undefined;
	return server?.requestIP(request)?.address;
}

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
			const ip = clientIp(request, server) ?? "unknown";
			const attemptsKey = `${ip}:${body.email}`;

			const retryAfter = await loginAttempts.retryAfter(attemptsKey);
			if (retryAfter !== null) {
				set.headers["retry-after"] = String(retryAfter);
				return status(429, tooManyAttempts);
			}

			const session = await authService.login(body);
			if (!session) {
				await loginAttempts.recordFailure(attemptsKey);
				return status(401, invalidCredentials);
			}
			await loginAttempts.reset(attemptsKey);
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
		async ({ token, cookie, status }) => {
			await authService.logout(token);
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
		async ({ user, cookie, status }) => {
			await authService.logoutAll(user.id);
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
