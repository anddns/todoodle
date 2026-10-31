import { z } from "zod";

export const apiErrorCodeSchema = z.enum([
	"VALIDATION_ERROR",
	"BAD_REQUEST",
	"NOT_FOUND",
	"INTERNAL_ERROR",
]);

export const apiErrorDetailSchema = z.object({
	path: z.string(),
	message: z.string(),
});

export const apiErrorSchema = z.object({
	error: z.object({
		code: apiErrorCodeSchema,
		message: z.string(),
		details: z.array(apiErrorDetailSchema).optional(),
	}),
});

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
