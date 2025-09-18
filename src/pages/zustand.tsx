import { useUserStore } from "@/store";
import { Button, List } from "antd";

function UserInfo() {
	const user = useUserStore((state) => state.user);

	function onChangeId() {
		useUserStore.setState({ user: { ...user, id: "123456" } });
	}

	function onChangeName() {
		useUserStore.setState({ user: { ...user, name: "张三" } });
	}

	function onChangeToken() {
		useUserStore.setState({ user: { ...user, token: "123456" } });
	}

	function onChangeRole() {
		useUserStore.setState({ user: { ...user, role: [1, 2, 3] } });
	}

	return (
		<div className="border border-gray-300 rounded-md p-4 my-4">
			<List>
				<List.Item
					actions={[
						<Button type="link" onClick={onChangeId}>
							修改ID
						</Button>,
					]}
				>
					<div>
						<span style={{ width: "80px", display: "inline-block" }}>ID:</span>
						<span className="text-primary">{user.id}</span>
					</div>
				</List.Item>
				<List.Item
					actions={[
						<Button type="link" onClick={onChangeName}>
							修改姓名
						</Button>,
					]}
				>
					<div>
						<span style={{ width: "80px", display: "inline-block" }}>Name:</span>
						<span className="text-primary">{user.name}</span>
					</div>
				</List.Item>
				<List.Item
					actions={[
						<Button type="link" onClick={onChangeToken}>
							修改Token
						</Button>,
					]}
				>
					<div>
						<span style={{ width: "80px", display: "inline-block" }}>Token:</span>
						<span className="text-primary">{user.token}</span>
					</div>
				</List.Item>
				<List.Item
					actions={[
						<Button type="link" onClick={onChangeRole}>
							修改角色
						</Button>,
					]}
				>
					<div>
						<span style={{ width: "80px", display: "inline-block" }}> Role:</span>
						<span className="text-primary">{user.role.join(",")}</span>
					</div>
				</List.Item>
			</List>
		</div>
	);
}

export default function Zustand() {
	return (
		<div>
			<h1 className="text-3xl font-bold">Zustand</h1>
			<UserInfo />
		</div>
	);
}
