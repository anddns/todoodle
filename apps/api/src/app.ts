import { Elysia } from "elysia";
import { tasksRoutes } from "./features/tasks";
import { errorHandler } from "./shared/errors";

export const app = new Elysia()
	.use(errorHandler)
	.get("/health", () => ({ status: "ok" }))
	.use(tasksRoutes);

export type App = typeof app;
