import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { menus, type MenuItem } from "@/router/routes";

export default function BaseLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [current, setCurrent] = useState("");

	//  根据地址栏查找当前激活菜单
	function findCurrentMenu(menus: MenuItem[], path: string) {
		const menu = menus.find((menu) => menu.key === path) ?? menus[0];
		const recursiveFind = (menu: MenuItem, path: string) => {
			if (menu.children && menu.children.length) {
				const child = menu.children[0];
				return recursiveFind(child, path);
			}
			return menu.key;
		};
		return recursiveFind(menu, path);
	}

	function handleClick({ item, key, keyPath }: { item: any; key: string; keyPath: string[] }) {
		console.log(item, key, keyPath);
		setCurrent(key);
		navigate(key);
	}

	useEffect(() => {
		const path = findCurrentMenu(menus, location.pathname);
		setCurrent(path);
		navigate(path);
	}, []);

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="flex gap-4 p-4">
				<Menu
					className="w-full"
					onClick={handleClick}
					items={menus}
					selectedKeys={[current]}
					mode="horizontal"
				/>
			</div>
			<div>
				<Outlet />
			</div>
		</div>
	);
}
