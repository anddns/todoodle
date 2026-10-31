import { type ApiErrorCode, apiErrorSchema } from "@todoodle/shared";

const messages: Record<ApiErrorCode, string> = {
	VALIDATION_ERROR: "Alguns dados enviados são inválidos.",
	BAD_REQUEST: "Não foi possível processar a requisição.",
	UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
	NOT_FOUND: "O item procurado não foi encontrado.",
	CONFLICT: "Os dados enviados entram em conflito com outro registro.",
	TOO_MANY_REQUESTS: "Muitas tentativas. Aguarde alguns minutos.",
	INTERNAL_ERROR: "Algo deu errado. Tente novamente.",
};

/** An error response from the API, with the code from its standard error body. */
export class ApiError extends Error {
	readonly status: number;
	readonly code: ApiErrorCode;

	constructor(status: number, body: unknown) {
		const parsed = apiErrorSchema.safeParse(body);
		const code = parsed.success ? parsed.data.error.code : "INTERNAL_ERROR";
		super(messages[code]);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

/** Returns a pt-BR message for the error, optionally replacing it for some codes. */
export function errorMessage(
	error: Error,
	overrides: Partial<Record<ApiErrorCode, string>> = {},
): string {
	if (error instanceof ApiError) return overrides[error.code] ?? error.message;
	return "Não foi possível conectar ao servidor.";
}

type EdenResult<T> =
	| { data: T; error: null }
	| { data: null; error: { status: number; value: unknown } };

/** Returns the response data, or throws an ApiError for error responses. */
export async function unwrap<T>(request: Promise<EdenResult<T>>): Promise<T> {
	const { data, error } = await request;
	if (error) throw new ApiError(error.status, error.value);
	return data;
}
