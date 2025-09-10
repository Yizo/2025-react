import { Link } from "react-router";
export default function NotFound() {
	return (
		<div className="flex flex-col items-center h-screen bg-gray-100 py-[20vh]">
			<h1 className="text-9xl text-primary">404</h1>
			<p className="text-2xl text-gray-500 mt-4">抱歉，您访问的页面不存在</p>
			<Link to="/" className="text-xl text-primary underline mt-4">
				返回首页
			</Link>
		</div>
	);
}
