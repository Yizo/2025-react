export const menuType = {
	LAYOUT: "layout",
	COMPONENT: "component",
} as const;

export type MenuType = (typeof menuType)[keyof typeof menuType];
