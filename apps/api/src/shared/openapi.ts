import { openapi } from "@elysiajs/openapi";
import { z } from "zod";

export const apiDocs = openapi({
	documentation: {
		info: {
			title: "Todoodle API",
			version: "0.1.0",
			description: "Task management API.",
		},
		tags: [
			{
				name: "Auth",
				description: "Register, sign in and manage sessions",
			},
			{
				name: "Tasks",
				description: "Create, read, update and delete tasks",
			},
			{ name: "Health", description: "Service status" },
		],
		components: {
			securitySchemes: {
				sessionCookie: {
					type: "apiKey",
					in: "cookie",
					name: "todoodle_session",
				},
			},
		},
	},
	mapJsonSchema: { zod: z.toJSONSchema },
});
