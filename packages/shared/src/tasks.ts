import { z } from "zod";

export const TASK_STATUSES = ["pending", "in_progress", "finished"] as const;

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskSchema = z.object({
	id: z.uuid({ version: "v7" }),
	title: z.string(),
	description: z.string().nullable(),
	status: taskStatusSchema,
	dueDate: z.iso.date().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export const createTaskSchema = z.object({
	title: z.string().trim().min(1).max(200),
	description: z.string().trim().nullable().optional(),
	status: taskStatusSchema.optional(),
	dueDate: z.iso.date().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
