import { lazy } from "react";
import type { RouteObject } from "react-router";
import {
	LazyImport,
	StaticLayout,
	BaseLayout,
	ErrorBoundary as ErrorBoundaryComponent,
} from "@/components";
import { menuType } from "@/enums";

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <BaseLayout />,
		ErrorBoundary: ErrorBoundaryComponent,
		children: [
			{
				path: "state",
				handle: {
					label: "数据状态",
					title: "数据状态",
					type: menuType.LAYOUT,
				},
				element: <StaticLayout />,
				children: [
					{
						index: true,
						path: "useState",
						handle: {
							label: "useState",
							title: "useState",
						},
						element: <LazyImport lazy={lazy(() => import("@/pages/useState"))} />,
					},
					{
						path: "useReducer",
						handle: {
							label: "useReducer",
							title: "useReducer",
						},
						element: <LazyImport lazy={lazy(() => import("@/pages/useReducer"))} />,
					},
				],
			},
			{
				path: "useReducer",
				handle: {
					label: "状态管理",
					title: "状态管理",
					type: "layout",
				},
				element: <StaticLayout />,
				children: [
					{
						index: true,
						path: "useRef",
						handle: {
							label: "useRef",
							title: "useRef",
						},
						element: <LazyImport lazy={lazy(() => import("@/pages/useRef"))} />,
					},
					{
						path: "useImperativeHandle",
						handle: {
							label: "useImperativeHandle",
							title: "useImperativeHandle",
						},
						element: (
							<LazyImport lazy={lazy(() => import("@/pages/useImperativeHandle"))} />
						),
					},
					{
						path: "useContent",
						handle: {
							label: "useContent",
							title: "useContent",
						},
						element: <LazyImport lazy={lazy(() => import("@/pages/useContent"))} />,
					},
				],
			},
			{
				path: "useSyncExternalStore",
				handle: {
					label: "订阅状态",
					title: "订阅状态",
				},
				Component: lazy(() => import("@/pages/useSyncExternalStore")),
			},
		],
	},
	{
		path: "*",
		Component: lazy(() => import("@/pages/NotFound")),
	},
];
