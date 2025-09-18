import { useRef, useImperativeHandle } from "react";
import { Button } from "antd";

const Child = ({ ref }: { ref: any }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	/**
	 * 有3个参数,
	 * 第三个参数和useState一样
	 * **/
	useImperativeHandle(ref, () => ({
		focus: () => {
			inputRef.current?.focus();
		},
	}));
	return (
		<div>
			<h2>Child组件</h2>
			<input ref={inputRef} className="border border-primary rounded-md p-2 mt-2" />
		</div>
	);
};

export default function UseImperativeHandle() {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<div>
			<h1 className="text-3xl font-bold">UseImperativeHandle</h1>
			<h2 className="text-primary mt-2">
				<span className="text-black">作用: </span>子组件控制暴露给父组件的属性和方法
			</h2>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<Child ref={inputRef} />
				<Button className="mt-4" onClick={() => inputRef.current?.focus()}>
					聚焦
				</Button>
			</div>
		</div>
	);
}
