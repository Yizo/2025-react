import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import zhCN from "antd/locale/zh_CN";
import { router } from "@/router";
import "@/styles/global.scss";
import "@/styles/index.css";

dayjs.locale("zh-cn");

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ConfigProvider
			locale={zhCN}
			theme={{
				token: {
					colorPrimary: import.meta.env.VITE_THEME,
				},
			}}
		>
			<RouterProvider router={router} />
		</ConfigProvider>
	</StrictMode>
);
