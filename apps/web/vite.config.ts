import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: { "@": `${import.meta.dirname}/src` },
	},
	server: {
		// Same origin as the API in development, so the session cookie just works
		proxy: { "/v1": "http://localhost:3000" },
	},
});
