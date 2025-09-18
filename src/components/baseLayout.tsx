import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { match } from "path-to-regexp";
import { menus, type MenuItem } from "@/router/routes";
import { menuType } from "@/enums";

type ActiveMenuItem = MenuItem & { pathParams: Record<string, any> };

function findActiveMenuItem(menuItems: MenuItem[], pathname: string): ActiveMenuItem | null {
	for (const item of menuItems) {
		const matcher = match(item.key);
		const matchResult = matcher(pathname);
		if (matchResult) {
			return { ...item, pathParams: matchResult?.params };
		}
		if (item.children) {
			const foundItem = findActiveMenuItem(item.children, pathname);
			if (foundItem) return foundItem;
		}
	}
	return null;
}
function processActiveMenuItem(activeItem: ActiveMenuItem | null): string {
	if (!activeItem) return "";
	if (activeItem.handle?.type !== menuType.LAYOUT) {
		return activeItem.key;
	}

	let currentItem: ActiveMenuItem | undefined = activeItem;

	while (currentItem && currentItem.handle?.type === menuType.LAYOUT) {
		const children = currentItem.children;
		if (children && children.length) {
			const child = children[0];
			currentItem = { ...child, pathParams: currentItem.pathParams } as ActiveMenuItem;
		} else {
			// 没有子路由，退出循环
			break;
		}
	}

	return currentItem ? currentItem.key : "";
}

export default function BaseLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [current, setCurrent] = useState("");

	function handleClick({ key }: { key: string }) {
		setCurrent(key);
		navigate(key);
	}

	useEffect(() => {
		const data = findActiveMenuItem(menus, location.pathname);
		console.log("data", data);
		if (data) {
			const key = processActiveMenuItem(data);
			console.log("key", key);
			setCurrent(key);
			navigate(key);
		}
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col p-4 gap-4">
			<div className="flex-none">
				<Menu
					className="w-full"
					onClick={handleClick}
					items={menus}
					selectedKeys={[current]}
					mode="horizontal"
				/>
			</div>
			<div className="box flex-auto p-4">
				<Outlet />
			</div>
		</div>
	);
}
