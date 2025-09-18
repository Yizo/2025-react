import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu } from "antd";
import { menus, findActiveMenuItem, processActiveMenuItem } from "@/routes";

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
		if (data) {
			const key = processActiveMenuItem(data);
			setCurrent(key);
			navigate(key);
		} else {
			const key = processActiveMenuItem(menus[0]);
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
