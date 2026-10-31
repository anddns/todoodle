import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meQueryOptions } from "@/features/auth";

/** Layout for pages that only make sense without a session. */
export const Route = createFileRoute("/_guest")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(meQueryOptions);
		if (user) throw redirect({ to: "/" });
	},
	component: GuestLayout,
});

function GuestLayout() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
			<p className="font-heading text-2xl font-semibold">Todoodle</p>
			<div className="w-full max-w-sm">
				<Outlet />
			</div>
		</main>
	);
}
