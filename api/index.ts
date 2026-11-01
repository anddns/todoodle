// Vercel Function entry point. Vercel calls the app's fetch handler for the paths
// that vercel.json rewrites here, keeping the original path (/v1/..., /health)
import { app } from "../apps/api/src/app";

export default app;
