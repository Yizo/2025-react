import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import App from "./App";

const base = import.meta.env.VITE_BASE;

console.log("base", base);

export const router = createBrowserRouter(
	[
		{
			path: "/",
			Component: App,
			children: [
				{
					index: true,
					Component: lazy(() => import("./pages/Home")),
				},
				{
					path: "about",
					Component: lazy(() => import("./pages/About")),
				},
			],
		},
		{
			path: "*",
			Component: lazy(() => import("./pages/NotFound")),
		},
	],
	{
		basename: base,
	}
);
