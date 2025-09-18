import { useRef, useState } from "react";
import { Button } from "antd";

export default function UseRef() {
	const inputRef = useRef<HTMLInputElement>(null);

	const num = useRef(0);
	// 每次都会重新赋值
	let num2 = 0;
	const [count, setCount] = useState(0);
	const handleClick = () => {
		setCount(count + 1);
		num.current = count;
		num2 += 1;
	};

	return (
		<div>
			<h1 className="text-2xl font-bold">UseRef</h1>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<h2 className="text-primary">
					<span className="text-black">作用1: </span> 获取DOM元素
				</h2>
				<div className="mt-2">
					<input
						type="text"
						ref={inputRef}
						className="border border-primary rounded-md p-2"
					/>
					<Button className="ml-4" onClick={() => inputRef.current?.focus()}>
						聚焦
					</Button>
				</div>
			</div>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<h2 className="text-primary">
					<span className="text-black">作用2: </span> 保存数据, 组件渲染时不会重新赋值
				</h2>
				<div className="mt-2">
					<p>num: {num.current}</p>
					<p>num2: {num2}</p>
					<p>count: {count}</p>
					<Button className="mt-4" onClick={handleClick}>
						点击
					</Button>
				</div>
			</div>
		</div>
	);
}
