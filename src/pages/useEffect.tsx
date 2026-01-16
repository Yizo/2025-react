function MainPage() {
	const [count, setCount] = useState<number>(0);

	useEffect(() => {
		console.log("useEffect页面更新");
	}, []);

	return (
		<div>
			<div>
				<Button type="primary" onClick={() => setCount(count + 1)}>
					Increment
				</Button>
				<p>Count: {count}</p>
			</div>
		</div>
	);
}

function Child() {
	// 使用 useEffect 实现动画效果
	useEffect(() => {
		const app1 = document.getElementById("app1") as HTMLDivElement;
		app1.style.transition = "opacity 3s";
		app1.style.opacity = "1";
	}, []);

	// 使用 useLayoutEffect 实现动画效果
	useLayoutEffect(() => {
		const app2 = document.getElementById("app2") as HTMLDivElement;
		app2.style.transition = "opacity 3s";
		app2.style.opacity = "1";
	}, []);

	return (
		<div>
			<div id="app1" style={{ opacity: 0 }}>
				app1
			</div>
			<div id="app2" style={{ opacity: 0 }}>
				app2
			</div>
		</div>
	);
}

export default function Main() {
	return (
		<>
			<MainPage />
			<Child />
		</>
	);
}
