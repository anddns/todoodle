import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth";

export const Route = createFileRoute("/_guest/login")({
	validateSearch: z.object({
		// Only paths inside the app, so the link cannot send users to another site
		redirect: z
			.string()
			.regex(/^\/(?!\/)/)
			.optional()
			.catch(undefined),
	}),
	head: () => ({ meta: [{ title: "Entrar · Todoodle" }] }),
	component: LoginPage,
});

function LoginPage() {
	const { redirect } = Route.useSearch();
	const navigate = Route.useNavigate();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Entrar</CardTitle>
				<CardDescription>Acesse a sua lista de tarefas.</CardDescription>
			</CardHeader>
			<CardContent>
				<LoginForm onSuccess={() => navigate({ href: redirect ?? "/" })} />
			</CardContent>
			<CardFooter className="justify-center text-sm text-muted-foreground">
				Ainda não tem conta?&nbsp;
				<Link
					to="/register"
					className="text-primary underline-offset-4 hover:underline"
				>
					Criar conta
				</Link>
			</CardFooter>
		</Card>
	);
}
