import { app } from "./app";

const port = Number(Bun.env.PORT ?? 3000);

app.listen(port);

console.log(
	`API running at http://${app.server?.hostname}:${app.server?.port}`,
);
