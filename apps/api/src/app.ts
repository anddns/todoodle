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
			200: z.object({ status: z.literal("ok") }).describe("A API está no ar"),
		},
		detail: { tags: ["Saúde"], summary: "Verificar se a API está no ar" },
	})
	.use(tasksRoutes);

export type App = typeof app;
