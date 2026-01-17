import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'antd/locale/zh_CN'
import Router from '@/router'
import '@/styles/index.css'

dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: import.meta.env.VITE_THEME,
        },
      }}
    >
      <App>
        <Router />
      </App>
    </ConfigProvider>
  </StrictMode>
)

// 关闭loading
const firstElement = document.getElementById('first')
if (firstElement && firstElement.style?.display !== 'none') {
  firstElement.style.display = 'none'
}
