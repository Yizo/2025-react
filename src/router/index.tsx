import { createBrowserRouter } from "react-router";
import { routes } from "./routes";

const base = import.meta.env.VITE_BASE;

console.log("base", base);

export const router = createBrowserRouter(routes, {
	basename: base,
});
