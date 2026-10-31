import type { Cookie } from "elysia";
import { config } from "../../shared/config";

export const SESSION_COOKIE = "todoodle_session";

type Cookies = Record<string, Cookie<unknown>>;

/** Stores the session token where browser JavaScript cannot read it. */
export function setSessionCookie(
	cookies: Cookies,
	session: { token: string; expiresAt: Date },
): void {
	cookies[SESSION_COOKIE]?.set({
		value: session.token,
		httpOnly: true,
		// Lax keeps the cookie off cross-site POST, PATCH and DELETE requests (CSRF)
		sameSite: "lax",
		secure: config.isProduction,
		path: "/",
		expires: session.expiresAt,
	});
}

export function readSessionCookie(cookies: Cookies): string | null {
	const token = cookies[SESSION_COOKIE]?.value;
	return typeof token === "string" ? token : null;
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies[SESSION_COOKIE]?.remove();
}
