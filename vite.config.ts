import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import AntdResolver from 'unplugin-antd-resolver'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  console.log('mode', mode)
  const env = loadEnv(mode, process.cwd())
  console.log('env', env)
  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      AutoImport({
        imports: ['react', 'react-dom', 'react-router'],
        dts: 'src/types/react-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      AutoImport({
        resolvers: [AntdResolver()],
        dts: 'src/types/antd-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
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
    },
  })
}
