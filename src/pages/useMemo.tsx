import React, { useState } from "react";
import { Button } from "antd";

const MemoChild1 = React.memo(({ data }: { data: any }) => {
	console.log("Child1");
	return (
		<div>
			<p>Child1-user-age: {data.age}</p>
		</div>
	);
});
const MemoChild2 = ({ data }: { data: any }) => {
	console.log("Child2");
	return (
		<div>
			<p>Child2-product-price: {data.price}</p>
		</div>
	);
};

function MemoComponent() {
	const [user, setUser] = useState(() => {
		return {
			name: "张三",
			age: 18,
			city: "北京",
		};
	});
	const [product, setProduct] = useState(() => {
		return {
			name: "苹果",
			price: 10,
			quantity: 10,
		};
	});

	function handleSetData(key: string) {
		if (key === "user") {
			setUser((data) => ({
				...data,
				age: data.age + 1,
			}));
		} else if (key === "product") {
			setProduct((data) => ({
				...data,
				price: data.price + 1,
			}));
		}
	}

	return (
		<div>
			<h2 className="text-primary text-2xl font-bold">React.memo渲染比对</h2>
			<div className="flex gap-4 mt-4">
				<div className="flex-1 border border-gray-300 rounded-md p-4">
					<h3 className="text-primary text-xl font-bold">使用了Memo</h3>
					<MemoChild1 data={user} />
					<Button className="mt-4" type="primary" onClick={() => handleSetData("user")}>
						修改user(渲染Child1和Child2)
					</Button>
				</div>
				<div className="flex-1 border border-gray-300 rounded-md p-4">
					<h3 className="text-primary text-xl font-bold">没有使用Memo</h3>
					<MemoChild2 data={product} />
					<Button
						className="mt-4"
						type="primary"
						onClick={() => handleSetData("product")}
					>
						修改product(只渲染Child2)
					</Button>
				</div>
			</div>
		</div>
	);
}

function UseMemoComponent() {
	return (
		<div>
			<h2 className="text-primary text-2xl font-bold">useMemo渲染</h2>
			<ul className="list-disc list-inside mt-4">
				<li>当需要缓存复杂计算结果时</li>
				<li>当需要避免不必要的重新计算时</li>
				<li>当计算逻辑复杂且耗时较长时</li>
				<li>用于缓存数据和组件</li>
			</ul>
		</div>
	);
}

export default function UseMemo() {
	return (
		<div>
			<h1 className="text-3xl font-bold">UseMemo</h1>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<h2 className="text-primary text-2xl font-bold">组件渲染条件</h2>
				<ul className="list-disc list-inside mt-4">
					<li>组件的 props 发生变化</li>
					<li>组件的 state 发生变化</li>
					<li>useContext 发生变化</li>
				</ul>
			</div>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<MemoComponent />
			</div>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<UseMemoComponent />
			</div>
		</div>
	);
}
