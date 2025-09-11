import { NavLink, Outlet } from "react-router";

const routes = [
	{
		path: "/about",
		label: "About",
	},
	{
		path: "/",
		label: "Home",
	},
	{
		path: "/useState",
		label: "useState",
	},
];

function App() {
	return (
		<div className="min-h-screen bg-gray-100">
			<div className="flex gap-4 p-4">
				{routes.map((route) => (
					<NavLink
						key={route.path}
						to={route.path}
						className={({ isActive }) => (isActive ? "text-primary" : "text-gray-500")}
					>
						{route.label}
					</NavLink>
				))}
			</div>
			<div className="mt-4">
				<Outlet />
			</div>
		</div>
	);
}

export default App;
