export type ApiErrorCode =
	| "VALIDATION_ERROR"
	| "BAD_REQUEST"
	| "NOT_FOUND"
	| "INTERNAL_ERROR";

export type ApiErrorDetail = {
	path: string;
	message: string;
};

export type ApiErrorBody = {
	error: {
		code: ApiErrorCode;
		message: string;
		details?: ApiErrorDetail[];
	};
};
