import { Elysia } from "elysia";
import { tasksRoutes } from "./features/tasks";

export const app = new Elysia()
	.get("/health", () => ({ status: "ok" }))
	.use(tasksRoutes);

export type App = typeof app;
