import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { ptBR } from "zod/locales";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { meQueryOptions } from "@/features/auth";
import { ApiError } from "@/lib/api-error";
import { routeTree } from "./routeTree.gen";

// Validation messages from the shared schemas, shown in the forms: the pt-BR
// locale, with friendlier wording for the most common cases
z.config({
	...ptBR(),
	customError: (issue) => {
		if (issue.input === "") return "Preencha este campo.";
		if (issue.code === "too_small" && issue.origin === "string") {
			return `Use pelo menos ${issue.minimum} caracteres.`;
		}
		if (issue.code === "too_big" && issue.origin === "string") {
			return `Use no máximo ${issue.maximum} caracteres.`;
		}
		return undefined;
	},
});

/** Sends the user to the login page when the session ends while using the app. */
function handleExpiredSession(error: Error) {
	const insideApp = router.state.matches.some(
		(match) => match.routeId === "/_authenticated",
	);
	if (error instanceof ApiError && error.status === 401 && insideApp) {
		queryClient.setQueryData(meQueryOptions.queryKey, null);
		// Runs the route guards again, which redirect to the login page
		router.invalidate();
	}
}

const queryClient = new QueryClient({
	queryCache: new QueryCache({ onError: handleExpiredSession }),
	mutationCache: new MutationCache({ onError: handleExpiredSession }),
	defaultOptions: {
		queries: {
			// Client errors (4xx) do not go away by retrying
			retry: (failureCount, error) =>
				!(error instanceof ApiError && error.status < 500) && failureCount < 2,
		},
	},
});

const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: "intent",
	// Route loaders read from TanStack Query, which has its own cache
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
	<StrictMode>
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
