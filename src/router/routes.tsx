import { lazy } from "react";
import type { RouteObject } from "react-router";
import { LazyImport } from "@/components";

export type RouteConfig = RouteObject & {
	meta?: {
		[key: string]: any;
	};
};

export const routes: RouteConfig[] = [
	{
		path: "/",
		element: <LazyImport lazy={lazy(() => import("@/components/baseLayout"))} />,
		children: [
			{
				index: true,
				path: "useState",
				Component: lazy(() => import("@/pages/useState")),
			},
			{
				path: "useReducer",
				Component: lazy(() => import("@/pages/useReducer")),
			},
			{
				path: "useSyncExternalStore",
				Component: lazy(() => import("@/pages/useSyncExternalStore")),
			},
		],
	},
	{
		path: "*",
		Component: lazy(() => import("@/pages/NotFound")),
	},
];
