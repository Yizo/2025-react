import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import AntdResolver from 'unplugin-antd-resolver';
import * as AntdIcons from '@ant-design/icons';

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  console.log('mode', mode);
  const env = loadEnv(mode, process.cwd());
  console.log('env', env);
  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      AutoImport({
        imports: ['react', 'react-dom', 'react-router', 'ahooks'],
        dts: 'src/types/react-auto-imports.d.ts',
      }),
      AutoImport({
        imports: [
          {
            from: '@ant-design/icons',
            imports: Object.keys(AntdIcons).filter((name) => /^[A-Z]/.test(name)),
          },
        ],
        dts: 'src/types/antd-icons-auto-imports.d.ts',
      }),
      AutoImport({
        resolvers: [AntdResolver()],
        dts: 'src/types/antd-auto-imports.d.ts',
      }),
      AutoImport({
        dts: 'src/types/app-auto-imports.d.ts',
        dirs: [
          'src/components/index.ts',
          'src/config/index.ts',
          'src/hooks/index.ts',
          'src/router/index.ts',
          'src/services/index.ts',
          'src/store/index.ts',
          'src/utils/index.ts',
        ],
        eslintrc: {
          enabled: true,
          // filepath: '.eslintrc-auto-import.json', // 放项目根目录
          globalsPropValue: true, // 让 ESLint 认识这些为全局变量，避免 no-undef
        },
        include: ['src/**/*.{ts,tsx}'],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    base: env.VITE_BASE,
    build: {
      outDir: env.VITE_BASE_DIR,
    },
    server: {
      host: true,
      proxy: {
        [env.VITE_API_BASE_URL]: {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          // 将VITE_API_BASE_URL替换为空
          rewrite: (path) => path.replace(env.VITE_API_BASE_URL, ''),
        },
      },
    },
  });
};
