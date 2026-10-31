import { app } from "./app";
import { config } from "./shared/config";

app.listen(config.port);

console.log(
	`API running at http://${app.server?.hostname}:${app.server?.port}`,
);
