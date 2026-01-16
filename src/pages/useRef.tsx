import type { InputRef } from "antd";

function MainPage() {
	const ref = useRef<HTMLDivElement>(null);
	const inputRef = useRef<InputRef>(null);

	function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		console.log(e.target.files);
		console.log("inputRef", inputRef.current?.input?.files);
	}

	// 清空文件输入框
	function onClear() {
		if (inputRef.current?.input) {
			inputRef.current.input.value = "";
			console.log("文件输入框已清空");
		}
	}

	useEffect(() => {
		console.log(ref.current?.clientHeight);
	}, []);

	return (
		<div ref={ref}>
			<div className="inline-block cursor-pointer">
				<Input
					className="cursor-pointer"
					ref={inputRef}
					type="file"
					onChange={(e) => onFileChange(e)}
				/>
			</div>
			<div className="mt-4">
				<Button onClick={onClear}>清理</Button>
			</div>
		</div>
	);
}

export default MainPage;
