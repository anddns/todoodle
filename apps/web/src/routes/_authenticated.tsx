import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meQueryOptions, useLogout } from "@/features/auth";

/** Layout for pages that require a session. */
export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ context, location }) => {
		const user = await context.queryClient.ensureQueryData(meQueryOptions);
		if (!user) {
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}
		return { user };
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const { user } = Route.useRouteContext();
	const navigate = Route.useNavigate();
	const logout = useLogout();

	return (
		<div className="min-h-svh">
			<header className="border-b">
				<div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
					<span className="font-heading text-lg font-semibold">Todoodle</span>
					<div className="flex items-center gap-3">
						<span className="hidden text-sm text-muted-foreground sm:inline">
							{user.email}
						</span>
						<Button
							variant="ghost"
							size="sm"
							disabled={logout.isPending}
							onClick={() =>
								logout.mutate(undefined, {
									onSettled: () => navigate({ to: "/login" }),
								})
							}
						>
							<LogOut data-icon="inline-start" />
							Sair
						</Button>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-3xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
