import { theme } from 'antd';

const themeVariables = {
  default: {
    /* 背景色: 由浅到深 */
    '--color-base-100': 'oklch(100% 0 0)',
    '--color-base-200': 'oklch(98% 0 0)' /* 次浅: 卡片容器背景, 主要 */,
    '--color-base-300': 'oklch(95% 0 0)' /* 最深: 禁用状态背景 */,
    /* 文字颜色 */
    '--color-base-content': 'oklch(21% 0.006 285.885)',
    /* 主色 */
    '--color-primary': '#6366f1',
    '--color-primary-content': '#fff',
    /* 边框颜色: neutral色300 */
    '--color-border': 'oklch(87% 0 0)',
  },
  dark: {
    '--color-base-100': 'oklch(25.33% 0.016 252.42)',
    '--color-base-200': 'oklch(23.26% 0.014 253.1)',
    '--color-base-300': 'oklch(21.15% 0.012 254.09)',
    '--color-base-content': '#fdd5a6d9',
    '--color-primary': '#fa8c16',
    '--color-primary-content': '#fff',
    /* neutral色600 */
    '--color-border': 'oklch(43.9% 0 0)',
  },
};

/**
 * 根据主题获取antd主题配置
 * @param name 主题名称
 * @returns antd主题配置
 */
export function getAntdThemeTokens(name?: 'light' | 'dark') {
  const map = {
    light: {
      algorithm: theme.defaultAlgorithm,
      token: {
        colorTextBase: themeVariables.default['--color-base-content'],
        colorPrimary: themeVariables.default['--color-primary'],
      },
      components: {
        Menu: {
          darkItemBg: themeVariables.default['--color-base-100'],
          darkSubMenuItemBg: themeVariables.default['--color-base-200'],
        },
      },
    },

    dark: {
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: themeVariables.dark['--color-primary'],
        colorTextBase: themeVariables.dark['--color-base-content'],
        colorPrimaryText: themeVariables.dark['--color-primary-content'],
      },
      components: {
        Menu: {
          darkItemBg: themeVariables.dark['--color-base-100'],
          darkSubMenuItemBg: themeVariables.dark['--color-base-200'],
        },
      },
    },
  };

  return map[name as keyof typeof map] ?? map.light;
}

// 生成完整的CSS样式字符串
function generateCompleteStyles() {
  let css = '/* OKLCH主题系统 */\n\n';

  // 默认主题（:root）
  const defaultTheme = themeVariables['default'];
  css += ':root {\n';
  for (const [prop, val] of Object.entries(defaultTheme)) {
    css += `  ${prop}: ${val};\n`;
  }
  css += '}\n\n';

  // 其他主题
  const themeNames = Object.keys(themeVariables).filter(
    (theme) => theme !== 'default'
  ) as (keyof typeof themeVariables)[];
  for (const themeName of themeNames) {
    const variables = themeVariables[themeName];
    css += `body[data-theme='${themeName}'] {\n`;
    for (const [prop, val] of Object.entries(variables)) {
      css += `  ${prop}: ${val};\n`;
    }
    css += '}\n\n';
  }

  return css;
}

/**
 * 设置css变量到style元素
 */
export function setThemeVariables() {
  const id = 'oklch-theme-styles';
  if (document.getElementById(id)) {
    return;
  }
  const style = document.createElement('style');
  style.id = id;
  style.textContent = generateCompleteStyles();
  document.head.appendChild(style);
  return style;
}
