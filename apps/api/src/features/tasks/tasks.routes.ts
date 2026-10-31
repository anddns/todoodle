import {
	createTaskSchema,
	listTasksQuerySchema,
	taskIdParamsSchema,
	updateTaskSchema,
} from "@todoodle/shared";
import { Elysia } from "elysia";
import { errorBody } from "../../shared/errors";
import { tasksService } from "./tasks.service";

const taskNotFound = errorBody("NOT_FOUND", "Task not found");

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
			tasksService.getById(params.id) ?? status(404, taskNotFound),
		{ params: taskIdParamsSchema },
	)
	.patch(
		"/:id",
		({ params, body, status }) =>
			tasksService.update(params.id, body) ?? status(404, taskNotFound),
		{ params: taskIdParamsSchema, body: updateTaskSchema },
	)
	.delete(
		"/:id",
		({ params, status }) =>
			tasksService.delete(params.id) ? status(204) : status(404, taskNotFound),
		{ params: taskIdParamsSchema },
	);
