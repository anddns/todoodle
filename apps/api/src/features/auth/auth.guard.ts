import { apiErrorSchema } from "@todoodle/shared";
import { Elysia } from "elysia";
import { errorBody } from "../../shared/errors";
import { authService } from "./auth.service";

const unauthorized = errorBody("UNAUTHORIZED", "Missing or invalid token");

export const unauthorizedResponse = apiErrorSchema.describe(
	"Missing or invalid token",
);

/** Documents the bearer token requirement in OpenAPI. */
export const bearerAuth = [{ bearerAuth: [] }];

/** Adds the `auth` route option, which requires a valid bearer token. */
export const authGuard = new Elysia({ name: "auth-guard" }).macro({
	auth: {
		resolve({ headers, status }) {
			const [scheme, token] = headers.authorization?.split(" ") ?? [];
			const user =
				scheme?.toLowerCase() === "bearer" && token
					? authService.authenticate(token)
					: null;
			if (!user || !token) return status(401, unauthorized);
			return { user, token };
		},
	},
});
