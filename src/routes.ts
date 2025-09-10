import { lazy } from "react";

// 使用懒加载导入页面组件
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

// 路由配置
export interface RouteConfig {
	path: string;
	element: React.LazyExoticComponent<() => React.JSX.Element>;
	label: string;
	showInNav?: boolean;
}

export const routes: RouteConfig[] = [
	{
		path: "/",
		element: Home,
		label: "Home",
		showInNav: true,
	},
	{
		path: "/about",
		element: About,
		label: "About",
		showInNav: true,
	},
];
