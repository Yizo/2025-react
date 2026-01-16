const MainLayout = () => {
	return (
		<div className="min-h-screen bg-gray-100">
			<div>MainLayout-header</div>
			<Outlet />
			<div>MainLayout-footer</div>
		</div>
	);
};

export default MainLayout;
