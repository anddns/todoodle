import { treaty } from "@elysiajs/eden";
import type { App } from "@todoodle/api";

// Same origin as the page (Vite proxies /v1 in development), so the browser
// sends the session cookie without any extra setup. parseDate is off because the
// shared schemas type dates as ISO strings, and Eden would turn them into Date objects
export const api = treaty<App>(window.location.origin, { parseDate: false }).v1;
