import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config([
	globalIgnores(["dist"]),
	// 基础配置
	js.configs.recommended,
	tseslint.configs.recommended,
	reactHooks.configs["recommended-latest"],
	reactRefresh.configs.vite,
	prettierConfig, // 禁用与 Prettier 冲突的 ESLint 规则
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			prettier,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"no-unused-vars": [
				"warn",
				{
					varsIgnorePattern: "^_", // 忽略变量名
					argsIgnorePattern: "^_", // 忽略函数参数名
				},
			],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					varsIgnorePattern: "^_",
					argsIgnorePattern: "^_",
				},
			],
			"prettier/prettier": "error", // 将 Prettier 错误作为 ESLint 错误显示
		},
	},
]);
