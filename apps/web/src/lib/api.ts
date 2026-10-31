import { treaty } from "@elysiajs/eden";
import type { App } from "@todoodle/api";

// Same origin as the page (Vite proxies /v1 in development), so the browser
// sends the session cookie without any extra setup
export const api = treaty<App>(window.location.origin).v1;
