import { createDatabase } from '@todoodle/database';
import { createApp } from './app';
import { env } from './env';

const database = createDatabase(env.DATABASE_URL);
const app = createApp(database, env.WEB_URL);

app.listen(env.PORT);
console.log(`Todoodle API running at http://${app.server?.hostname}:${app.server?.port}\n`);
