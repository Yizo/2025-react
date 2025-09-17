import { useState } from "react";
import { produce } from "immer";
import { Card, Space, Button, Divider, Tag } from "antd";

function ArrayList() {
	const [arr, setArr] = useState<number[]>(() => {
		return Array.from({ length: 10 }, (_, index) => index + 1);
	});
	const handleAdd = () => {
		setArr(
			produce((draft) => {
				const max = Math.max(...draft, 0);
				draft.push(max + 1);
			})
		);
	};
	const handleDelete = (index: number) => {
		setArr(
			produce((draft) => {
				draft.splice(index, 1);
			})
		);
	};
	const handleEdit = (index: number) => {
		setArr(
			produce((draft) => {
				const max = Math.max(...draft, 0);
				draft.splice(index + 1, 0, max + 1);
			})
		);
	};

	// extra组件
	const extra: () => React.ReactNode = () => {
		return (
			<>
				<Button type="link" size="small" onClick={handleAdd}>
					新增
				</Button>
			</>
		);
	};

	return (
		<Card
			className="shadow-md rounded-lg"
			style={{ width: 300 }}
			title="ArrayList"
			extra={extra()}
		>
			<ul>
				{arr.map((item, index) => (
					<li key={item} className="flex justify-between mb-2">
						<Tag
							color={`rgba(${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},
          ${Math.floor(Math.random() * 256)},
          0.75)`} // 透明度 0~1 可调
						>
							{item}
						</Tag>
						<div>
							<Button type="link" size="small" onClick={() => handleDelete(index)}>
								删除
							</Button>
							<Divider type="vertical" />
							<Button type="link" size="small" onClick={() => handleEdit(index)}>
								插入
							</Button>
						</div>
					</li>
				))}
			</ul>
		</Card>
	);
}
export default function Main() {
	return (
		<div>
			<Space size="middle">
				<ArrayList />
			</Space>
		</div>
	);
}
