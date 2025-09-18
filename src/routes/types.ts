import type { ReactNode } from "react";

export type MenuItem = {
	key: string;
	handle: Record<string, any> | undefined;
	label: string | ReactNode;
	title: string;
	children?: MenuItem[];
};
