import { useReducer } from "react";
import { produce } from "immer";
import { Table, Button, Divider, InputNumber } from "antd";

/**
 * 直接调用函数作为第二个参数：这个函数会在每次组件渲染时执行。[更简洁]
 * 使用init函数：init函数只在组件初次渲染时执行一次。[性能好,更灵活]
 */

type RowItem = {
	id: number;
	item: string;
	quantity: number;
	price: number;
	total: number;
};

type Action =
	| { type: "add-end" }
	| { type: "add-after"; index: number }
	| { type: "delete"; index: number }
	| { type: "update"; index: number; field: "quantity" | "price"; value: number };

function calculateTotal(quantity: number, price: number) {
	return Number(((quantity || 0) * (price || 0)).toFixed(2));
}

function createNewRow(nextId: number): RowItem {
	return {
		id: nextId,
		item: `物品${nextId}`,
		quantity: 1,
		price: 1,
		total: calculateTotal(1, 1),
	};
}

function reducer(state: RowItem[], action: Action): RowItem[] {
	switch (action.type) {
		case "add-end": {
			const nextId = Math.max(0, ...state.map((r) => r.id)) + 1;
			return produce(state, (draft) => {
				draft.push(createNewRow(nextId));
			});
		}
		case "add-after": {
			const nextId = Math.max(0, ...state.map((r) => r.id)) + 1;
			return produce(state, (draft) => {
				draft.splice(action.index + 1, 0, createNewRow(nextId));
			});
		}
		case "delete": {
			const list = state.slice();
			list.splice(action.index, 1);
			return list;
		}
		case "update": {
			const list = state.map((row, idx) => {
				if (idx !== action.index) return row;
				const nextQuantity =
					action.field === "quantity" ? Number(action.value || 0) : row.quantity;
				const nextPrice = action.field === "price" ? Number(action.value || 0) : row.price;
				return {
					...row,
					quantity: nextQuantity,
					price: nextPrice,
					total: calculateTotal(nextQuantity, nextPrice),
				};
			});
			return list;
		}
		default:
			return state;
	}
}

function TableList() {
	const [dataSource, dispatch] = useReducer(reducer, [
		{ id: 1, item: "苹果", quantity: 10, price: 10, total: calculateTotal(10, 10) },
	]);

	const columns = [
		{
			title: "物品",
			dataIndex: "item",
		},
		{
			title: "数量",
			dataIndex: "quantity",
			render: (_: any, record: RowItem, index: number) => (
				<InputNumber
					min={0}
					value={record.quantity}
					onChange={(val) =>
						dispatch({
							type: "update",
							index,
							field: "quantity",
							value: Number(val || 0),
						})
					}
				/>
			),
		},
		{
			title: "价格",
			dataIndex: "price",
			render: (_: any, record: RowItem, index: number) => (
				<InputNumber
					min={0}
					value={record.price}
					formatter={(v) => `${v}`}
					onChange={(val) =>
						dispatch({ type: "update", index, field: "price", value: Number(val || 0) })
					}
				/>
			),
		},
		{
			title: "总价",
			dataIndex: "total",
		},
		{
			title: "操作",
			dataIndex: "action",
			render: (_: any, record: RowItem, index: number) => {
				return (
					<>
						<Button type="link" onClick={() => dispatch({ type: "add-after", index })}>
							新增
						</Button>
						<Divider type="vertical" />
						<Button
							type="link"
							danger
							onClick={() => dispatch({ type: "delete", index })}
						>
							删除
						</Button>
						<Divider type="vertical" />
						<Button
							type="link"
							onClick={() =>
								dispatch({
									type: "update",
									index,
									field: "quantity",
									value: record.quantity,
								})
							}
						>
							修改
						</Button>
					</>
				);
			},
		},
	];

	return (
		<div className="space-y-4">
			<Button type="primary" onClick={() => dispatch({ type: "add-end" })}>
				新增
			</Button>
			<Table rowKey="id" bordered dataSource={dataSource} columns={columns}></Table>
		</div>
	);
}

export default function Main() {
	return (
		<div className="m-6 box">
			<TableList />
		</div>
	);
}
