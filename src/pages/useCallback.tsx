export default function UseCallback() {
	return (
		<div>
			<h1 className="text-3xl font-bold">UseCallback</h1>
			<h2 className="text-primary mt-2">
				<span className="text-black">作用: </span>避免因为函数组件重新渲染导致函数重新创建
			</h2>
			<div></div>
		</div>
	);
}
