import {
	apiErrorSchema,
	createTaskSchema,
	listTasksQuerySchema,
	taskIdParamsSchema,
	taskSchema,
	updateTaskSchema,
} from "@todoodle/shared";
import { Elysia } from "elysia";
import { z } from "zod";
import { errorBody } from "../../shared/errors";
import { tasksService } from "./tasks.service";

const taskNotFound = errorBody("NOT_FOUND", "Task not found");

const invalidRequestResponse = apiErrorSchema.describe("Invalid request");
const taskNotFoundResponse = apiErrorSchema.describe("Task not found");

export const tasksRoutes = new Elysia({
	prefix: "/tasks",
	detail: { tags: ["Tasks"] },
})
	.post("", ({ body, status }) => status(201, tasksService.create(body)), {
		body: createTaskSchema,
		response: {
			201: taskSchema.describe("Task created"),
			422: invalidRequestResponse,
		},
		detail: { summary: "Create a task" },
	})
	.get("", ({ query }) => tasksService.list(query), {
		query: listTasksQuerySchema,
		response: {
			200: z.array(taskSchema).describe("List of tasks"),
			422: invalidRequestResponse,
		},
		detail: {
			summary: "List tasks",
			description:
				"Returns tasks from newest to oldest, optionally filtered by status.",
		},
	})
	.get(
		"/:id",
		({ params, status }) =>
			tasksService.getById(params.id) ?? status(404, taskNotFound),
		{
			params: taskIdParamsSchema,
			response: {
				200: taskSchema.describe("Task found"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: { summary: "Get a task" },
		},
	)
	.patch(
		"/:id",
		({ params, body, status }) =>
			tasksService.update(params.id, body) ?? status(404, taskNotFound),
		{
			params: taskIdParamsSchema,
			body: updateTaskSchema,
			response: {
				200: taskSchema.describe("Task updated"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Update a task",
				description:
					"Updates only the fields sent. At least one field is required.",
			},
		},
	)
	.delete(
		"/:id",
		({ params, status }) =>
			tasksService.delete(params.id)
				? status(204, undefined)
				: status(404, taskNotFound),
		{
			params: taskIdParamsSchema,
			response: {
				204: z.null().optional().describe("Task deleted"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Delete a task",
				description: "Permanently deletes the task.",
			},
		},
	);
