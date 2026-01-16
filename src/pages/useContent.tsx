// 创建Context
interface ContentContextType {
	count: number;
	increment: () => void;
	decrement: () => void;
	reset: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// 自定义hook，用于消费Context
function useContent() {
	const context = useContext(ContentContext);
	if (!context) {
		throw new Error("useContent must be used within a ContentProvider");
	}
	return context;
}

// Provider组件
function ContentProvider({ children }: { children: React.ReactNode }) {
	const [count, setCount] = useState(0);

	const increment = () => setCount((prev) => prev + 1);
	const decrement = () => setCount((prev) => prev - 1);
	const reset = () => setCount(0);

	const value = {
		count,
		increment,
		decrement,
		reset,
	};

	return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// 子组件：计数器控制面板
function CounterControls() {
	const { increment, decrement, reset } = useContent();

	return (
		<Card title="计数器控制面板" className="shadow-md">
			<Space>
				<Button type="primary" onClick={increment}>
					增加
				</Button>
				<Button danger onClick={decrement}>
					减少
				</Button>
				<Button onClick={reset}>重置</Button>
			</Space>
		</Card>
	);
}

// 子组件：计数器显示
function CounterDisplay() {
	const { count } = useContent();

	return (
		<Card title="计数器显示" className="shadow-md">
			<Statistic
				title="当前计数"
				value={count}
				styles={{
					content: {
						color: count > 0 ? "#3f8600" : count < 0 ? "#cf1322" : "#1890ff",
					},
				}}
			/>
		</Card>
	);
}

// 子组件：计数器状态指示器
function CounterStatus() {
	const { count } = useContent();

	const getStatus = () => {
		if (count > 0) return { text: "正数", color: "#3f8600" };
		if (count < 0) return { text: "负数", color: "#cf1322" };
		return { text: "零", color: "#1890ff" };
	};

	const status = getStatus();

	return (
		<Card title="计数器状态" className="shadow-md">
			<div style={{ color: status.color, fontSize: "16px", fontWeight: "bold" }}>
				当前状态: {status.text}
			</div>
		</Card>
	);
}

// 子组件：计数器操作历史
function CounterHistory() {
	const { count } = useContent();

	const getHistoryMessage = () => {
		if (count === 0) return "计数器已重置";
		if (count > 0) return `已增加 ${count} 次`;
		return `已减少 ${Math.abs(count)} 次`;
	};

	return (
		<Card title="操作历史" className="shadow-md">
			<p>{getHistoryMessage()}</p>
		</Card>
	);
}

function MainPage() {
	return (
		<ContentProvider>
			<div className="space-y-4">
				<h2 className="text-xl font-bold mb-4">跨组件数据通信示例</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CounterControls />
					<CounterDisplay />
					<CounterStatus />
					<CounterHistory />
				</div>

				<Divider />

				<Card title="说明" className="shadow-md">
					<p className="mb-2">这个示例演示了如何使用React Context实现跨组件数据通信：</p>
					<ul className="list-disc list-inside space-y-1">
						<li>
							使用 <code>createContext</code> 创建上下文
						</li>
						<li>
							使用 <code>useContext</code> 在子组件中消费数据
						</li>
						<li>Provider 组件提供共享状态和更新方法</li>
						<li>多个子组件可以同时访问和修改同一个状态</li>
					</ul>
				</Card>
			</div>
		</ContentProvider>
	);
}

export default function Main() {
	return <MainPage />;
}
