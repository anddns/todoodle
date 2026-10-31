import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	CreateTaskInput,
	TaskStatus,
	UpdateTaskInput,
} from "@todoodle/shared";
import { api } from "@/lib/api";
import { unwrap } from "@/lib/api-error";

const tasksKey = ["tasks"] as const;

/** The signed-in user's tasks, newest first, optionally filtered by status. */
export function tasksQueryOptions(status?: TaskStatus) {
	return queryOptions({
		queryKey: [...tasksKey, { status }],
		queryFn: () => unwrap(api.tasks.get({ query: status ? { status } : {} })),
	});
}

/**
 * Refetches every task list after a change. Returning the promise keeps the
 * mutation pending until the lists are fresh, so the screen never shows stale data.
 */
function useInvalidateTasks() {
	const queryClient = useQueryClient();
	return () => queryClient.invalidateQueries({ queryKey: tasksKey });
}

export function useCreateTask() {
	const invalidateTasks = useInvalidateTasks();
	return useMutation({
		mutationFn: (input: CreateTaskInput) => unwrap(api.tasks.post(input)),
		onSuccess: invalidateTasks,
	});
}

export function useUpdateTask() {
	const invalidateTasks = useInvalidateTasks();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
			unwrap(api.tasks({ id }).patch(input)),
		onSuccess: invalidateTasks,
	});
}

export function useDeleteTask() {
	const invalidateTasks = useInvalidateTasks();
	return useMutation({
		mutationFn: (id: string) => unwrap(api.tasks({ id }).delete()),
		onSuccess: invalidateTasks,
	});
}
