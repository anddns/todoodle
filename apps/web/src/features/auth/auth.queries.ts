import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { LoginInput, RegisterInput, User } from "@todoodle/shared";
import { api } from "@/lib/api";
import { ApiError, unwrap } from "@/lib/api-error";

/** The signed-in user, or null when there is no valid session. */
export const meQueryOptions = queryOptions({
	queryKey: ["auth", "me"],
	queryFn: async (): Promise<User | null> => {
		try {
			return await unwrap(api.auth.me.get());
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) return null;
			throw error;
		}
	},
	staleTime: 5 * 60 * 1000,
});

export function useLogin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: LoginInput) => unwrap(api.auth.login.post(input)),
		onSuccess: (user) =>
			queryClient.setQueryData(meQueryOptions.queryKey, user),
	});
}

export function useRegister() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: RegisterInput) => unwrap(api.auth.register.post(input)),
		onSuccess: (user) =>
			queryClient.setQueryData(meQueryOptions.queryKey, user),
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => unwrap(api.auth.logout.post()),
		// Drops every cached query, so the next user never sees the previous one's data
		onSettled: () => {
			queryClient.clear();
			queryClient.setQueryData(meQueryOptions.queryKey, null);
		},
	});
}
