import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@todoodle/shared";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, errorMessage } from "@/lib/api-error";
import { useRegister } from "./auth.queries";

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
	const register = useRegister();
	const form = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = form.handleSubmit((input) =>
		register.mutate(input, {
			onSuccess,
			onError: (error) => {
				if (error instanceof ApiError && error.code === "CONFLICT") {
					form.setError("email", {
						message: "Este e-mail já está cadastrado.",
					});
				}
			},
		}),
	);

	// A conflict is shown on the email field instead
	const showAlert =
		register.error &&
		!(register.error instanceof ApiError && register.error.code === "CONFLICT");

	return (
		<form onSubmit={onSubmit} noValidate>
			<FieldGroup>
				{showAlert && (
					<Alert variant="destructive">
						<AlertTitle>{errorMessage(register.error)}</AlertTitle>
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
								autoComplete="new-password"
								aria-invalid={fieldState.invalid}
							/>
							<FieldDescription>Use de 8 a 128 caracteres.</FieldDescription>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Button type="submit" disabled={register.isPending}>
					{register.isPending ? "Criando conta..." : "Criar conta"}
				</Button>
			</FieldGroup>
		</form>
	);
}
