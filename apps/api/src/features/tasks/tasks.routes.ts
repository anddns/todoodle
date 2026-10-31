import {
	createTaskSchema,
	listTasksQuerySchema,
	taskIdParamsSchema,
	updateTaskSchema,
} from "@todoodle/shared";
import { Elysia } from "elysia";
import { tasksService } from "./tasks.service";

export const tasksRoutes = new Elysia({ prefix: "/tasks" })
	.post("/", ({ body, status }) => status(201, tasksService.create(body)), {
		body: createTaskSchema,
	})
	.get("/", ({ query }) => tasksService.list(query), {
		query: listTasksQuerySchema,
	})
	.get(
		"/:id",
		({ params, status }) =>
			tasksService.getById(params.id) ??
			status(404, { message: "Task not found" }),
		{ params: taskIdParamsSchema },
	)
	.patch(
		"/:id",
		({ params, body, status }) =>
			tasksService.update(params.id, body) ??
			status(404, { message: "Task not found" }),
		{ params: taskIdParamsSchema, body: updateTaskSchema },
	);
