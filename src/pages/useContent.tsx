import { useContext, createContext, useState } from "react";
import { Button } from "antd";

const Context = createContext({ theme: "light", setTheme: (theme: string) => {} });

const Parent = () => {
	return <Child />;
};

const Child = () => {
	return <Grandson />;
};

const Grandson = () => {
	const content = useContext(Context);

	function handleChangeTheme() {
		const newTheme = content.theme === "light" ? "dark" : "light";
		content.setTheme(newTheme);
	}

	return (
		<div>
			<div>{content.theme}</div>
			<Button className="mt-4" onClick={handleChangeTheme}>
				Change Theme
			</Button>
		</div>
	);
};

export default function UseContent() {
	const [theme, setTheme] = useState("light");
	return (
		<div>
			<div>
				<h1 className="text-3xl font-bold">UseContent</h1>
				<h2 className="text-primary mt-2">
					<span className="text-black">作用: </span>跨层级共享状态
				</h2>
			</div>
			<div className="mt-4 border border-gray-300 rounded-md p-4">
				<Context.Provider value={{ theme: theme, setTheme: setTheme }}>
					<Parent />
				</Context.Provider>
			</div>
		</div>
	);
}
