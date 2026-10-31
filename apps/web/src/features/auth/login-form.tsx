import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@todoodle/shared";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api-error";
import { useLogin } from "./auth.queries";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
	const login = useLogin();
	const form = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = form.handleSubmit((input) =>
		login.mutate(input, { onSuccess }),
	);

	return (
		<form onSubmit={onSubmit} noValidate>
			<FieldGroup>
				{login.error && (
					<Alert variant="destructive">
						<AlertTitle>
							{errorMessage(login.error, {
								UNAUTHORIZED: "E-mail ou senha inválidos.",
								TOO_MANY_REQUESTS:
									"Muitas tentativas erradas. Aguarde alguns minutos e tente de novo.",
							})}
						</AlertTitle>
					</Alert>
				)}
				<Controller
					name="email"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="email"
								autoComplete="email"
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					name="password"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>Senha</FieldLabel>
							<Input
								{...field}
								id={field.name}
								type="password"
								autoComplete="current-password"
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Button type="submit" disabled={login.isPending}>
					{login.isPending ? "Entrando..." : "Entrar"}
				</Button>
			</FieldGroup>
		</form>
	);
}
