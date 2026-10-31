import { openapi } from "@elysiajs/openapi";
import { z } from "zod";

// The OpenAPI docs are written in Brazilian Portuguese
export const apiDocs = openapi({
	documentation: {
		info: {
			title: "Todoodle API",
			version: "0.1.0",
			description: "API de gerenciamento de tarefas.",
		},
		tags: [
			{
				name: "Tarefas",
				description: "Criação, consulta, atualização e exclusão de tarefas",
			},
			{ name: "Saúde", description: "Status do serviço" },
		],
	},
	mapJsonSchema: { zod: z.toJSONSchema },
});
