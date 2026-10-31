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

// Descriptions shown in the OpenAPI docs, which are written in Brazilian Portuguese
const invalidRequestResponse = apiErrorSchema.describe("Requisição inválida");
const taskNotFoundResponse = apiErrorSchema.describe("Tarefa não encontrada");

export const tasksRoutes = new Elysia({
	prefix: "/tasks",
	detail: { tags: ["Tarefas"] },
})
	.post("", ({ body, status }) => status(201, tasksService.create(body)), {
		body: createTaskSchema,
		response: {
			201: taskSchema.describe("Tarefa criada"),
			422: invalidRequestResponse,
		},
		detail: { summary: "Criar uma tarefa" },
	})
	.get("", ({ query }) => tasksService.list(query), {
		query: listTasksQuerySchema,
		response: {
			200: z.array(taskSchema).describe("Lista de tarefas"),
			422: invalidRequestResponse,
		},
		detail: {
			summary: "Listar tarefas",
			description:
				"Retorna as tarefas da mais recente para a mais antiga, com filtro opcional por status.",
		},
	})
	.get(
		"/:id",
		({ params, status }) =>
			tasksService.getById(params.id) ?? status(404, taskNotFound),
		{
			params: taskIdParamsSchema,
			response: {
				200: taskSchema.describe("Tarefa encontrada"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: { summary: "Buscar uma tarefa" },
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
				200: taskSchema.describe("Tarefa atualizada"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Atualizar uma tarefa",
				description:
					"Atualiza apenas os campos enviados. É obrigatório enviar pelo menos um campo.",
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
				204: z.null().optional().describe("Tarefa excluída"),
				404: taskNotFoundResponse,
				422: invalidRequestResponse,
			},
			detail: {
				summary: "Excluir uma tarefa",
				description: "Exclui a tarefa de forma definitiva.",
			},
		},
	);
