import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		component: RootLayout,
		notFoundComponent: NotFound,
	},
);

function RootLayout() {
	return (
		<>
			<HeadContent />
			<Outlet />
			<Toaster />
		</>
	);
}

function NotFound() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="font-heading text-2xl font-semibold">
				Página não encontrada
			</h1>
			<p className="text-muted-foreground">O endereço acessado não existe.</p>
			<Button render={<Link to="/" />}>Voltar ao início</Button>
		</main>
	);
}
