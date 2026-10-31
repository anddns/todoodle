import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth";

export const Route = createFileRoute("/_guest/register")({
	head: () => ({ meta: [{ title: "Criar conta · Todoodle" }] }),
	component: RegisterPage,
});

function RegisterPage() {
	const navigate = Route.useNavigate();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Criar conta</CardTitle>
				<CardDescription>
					Cadastre-se para começar a organizar suas tarefas.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RegisterForm onSuccess={() => navigate({ to: "/" })} />
			</CardContent>
			<CardFooter className="justify-center text-sm text-muted-foreground">
				Já tem conta?&nbsp;
				<Link
					to="/login"
					className="text-primary underline-offset-4 hover:underline"
				>
					Entrar
				</Link>
			</CardFooter>
		</Card>
	);
}
