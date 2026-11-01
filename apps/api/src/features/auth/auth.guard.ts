import { apiErrorSchema } from "@todoodle/shared";
import { Elysia } from "elysia";
import { errorBody } from "../../shared/errors";
import { clearSessionCookie, readSessionCookie } from "./auth.cookie";
import { authService } from "./auth.service";

const unauthorized = errorBody("UNAUTHORIZED", "Missing or invalid session");

export const unauthorizedResponse = apiErrorSchema.describe(
	"Missing or invalid session",
);

/** Documents the session cookie requirement in OpenAPI. */
export const sessionAuth = [{ sessionCookie: [] }];

/** Adds the `auth` route option, which requires a valid session cookie. */
export const authGuard = new Elysia({ name: "auth-guard" }).macro({
	auth: {
		async resolve({ cookie, status }) {
			const token = readSessionCookie(cookie);
			const user = token ? await authService.authenticate(token) : null;
			if (!user || !token) {
				// Clears a stale cookie so the browser stops sending it
				clearSessionCookie(cookie);
				return status(401, unauthorized);
			}
			return { user, token };
		},
	},
});
