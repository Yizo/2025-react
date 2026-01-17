import StaticLayout from './StaticLayout'

const MainLayout = () => {
	return (
		<div className="min-h-screen bg-gray-100">
			<div>MainLayout-header</div>
			<StaticLayout />
			<div>MainLayout-footer</div>
		</div>
	);
};

export default MainLayout;
