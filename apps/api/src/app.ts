import { Elysia } from "elysia";
import { z } from "zod";
import { tasksRoutes } from "./features/tasks";
import { errorHandler } from "./shared/errors";
import { apiDocs } from "./shared/openapi";

export const app = new Elysia()
	.use(errorHandler)
	.use(apiDocs)
	.get("/health", () => ({ status: "ok" as const }), {
		response: {
			200: z.object({ status: z.literal("ok") }).describe("The API is running"),
		},
		detail: { tags: ["Health"], summary: "Check that the API is running" },
	})
	.group("/v1", (v1) => v1.use(tasksRoutes));

export type App = typeof app;
