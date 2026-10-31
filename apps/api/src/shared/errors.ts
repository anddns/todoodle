import type {
	ApiErrorBody,
	ApiErrorCode,
	ApiErrorDetail,
} from "@todoodle/shared";
import { Elysia } from "elysia";

export function errorBody(
	code: ApiErrorCode,
	message: string,
	details?: ApiErrorDetail[],
): ApiErrorBody {
	return { error: { code, message, ...(details && { details }) } };
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
	{ as: "global" },
	({ code, error, status }) => {
		switch (code) {
			case "VALIDATION":
				// A response that fails its schema is a server bug, not a client error
				if (error.type === "response") {
					console.error(error);
					return status(
						500,
						errorBody("INTERNAL_ERROR", "Internal server error"),
					);
				}
				return status(
					422,
					errorBody(
						"VALIDATION_ERROR",
						"Invalid request",
						error.all.map((issue) => ({
							path: issue.path,
							message: issue.message,
						})),
					),
				);
			case "PARSE":
				return status(400, errorBody("BAD_REQUEST", "Malformed request body"));
			case "NOT_FOUND":
				return status(404, errorBody("NOT_FOUND", "Route not found"));
			default:
				console.error(error);
				return status(
					500,
					errorBody("INTERNAL_ERROR", "Internal server error"),
				);
		}
	},
);
