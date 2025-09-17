import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
	console.log("mode", mode);
	const env = loadEnv(mode, process.cwd());
	console.log("env", env);
	return defineConfig({
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
		base: env.VITE_BASE,
		build: {
			outDir: env.VITE_BASE_DIR,
		},
	});
};
