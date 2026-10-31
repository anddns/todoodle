import { createTaskSchema } from "@todoodle/shared";
import { Elysia } from "elysia";
import { tasksService } from "./tasks.service";

export const tasksRoutes = new Elysia({ prefix: "/tasks" }).post(
	"/",
	({ body, status }) => status(201, tasksService.create(body)),
	{ body: createTaskSchema },
);
