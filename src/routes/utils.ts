import type { RouteObject } from "react-router";
import { match } from "path-to-regexp";
import { menuType } from "@/enums";
import type { MenuItem } from "./types";

/**
 * 将路由转换为 Ant Design 的菜单
 * @param routes 路由配置
 * @returns 菜单配置
 */
export function routesToAntdMenu(routes: RouteObject[]): MenuItem[] {
	const result: MenuItem[] = [];

	function handle(route: RouteObject, parentPath = "", parentItem: MenuItem | null = null) {
		const fullPath = route.path
			? route.path.startsWith("/")
				? route.path
				: `${parentPath}/${route.path}`.replace(/\/+/g, "/")
			: parentPath;

		const menuItem: MenuItem = {
			key: fullPath,
			label: route.handle?.label ?? "",
			title: route.handle?.title ?? "",
			handle: route.handle,
		};

		if (route.handle && route.handle.label) {
			if (parentItem) {
				if (!parentItem.children) {
					parentItem.children = [];
				}
				parentItem.children.push(menuItem);
			} else {
				result.push(menuItem);
			}
		}

		const children = (route.children || []).filter((item) => item.handle && item.handle.label);
		if (children.length) {
			for (let i = 0; i < children.length; i++) {
				handle(children[i], fullPath, menuItem.label ? menuItem : null);
			}
		}
	}

	for (let i = 0; i < routes.length; i++) {
		handle(routes[i]);
	}

	return result;
}

/**
 * 查找当前激活的菜单项
 * @param menuItems 菜单项
 * @param pathname 当前路径
 * @returns 当前激活的菜单项
 */
export function findActiveMenuItem(menuItems: MenuItem[], pathname: string): MenuItem | null {
	for (const item of menuItems) {
		const matcher = match(item.key);
		const matchResult = matcher(pathname);
		if (matchResult) {
			return item;
		}
		if (item.children) {
			const foundItem = findActiveMenuItem(item.children, pathname);
			if (foundItem) return foundItem;
		}
	}
	return null;
}

/**
 * 处理当前激活的菜单项
 * @param activeItem 当前激活的菜单项
 * @returns 当前激活的菜单项
 */
export function processActiveMenuItem(activeItem: MenuItem | null): string {
	if (!activeItem) return "";
	if (activeItem.handle?.type !== menuType.LAYOUT) {
		return activeItem.key;
	}

	let currentItem: MenuItem | null = activeItem;

	while (currentItem && currentItem.handle?.type === menuType.LAYOUT) {
		const children = currentItem?.children as MenuItem[];
		if (children && children.length) {
			currentItem = children[0];
		} else {
			break;
		}
	}

	return currentItem ? currentItem.key : "";
}
