import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App, theme } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'antd/locale/zh_CN'
import Router from '@/router'
import '@/styles/index.css'
import { useTheme } from '@/store/system'

dayjs.locale('zh-cn')

export function MainApp() {
    const systemTheme = useTheme()

    return <ConfigProvider
        locale={zhCN}
        theme={{
            token: {
                colorPrimary: import.meta.env.VITE_THEME,
            },
            algorithm: systemTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
    >
        <App>
            <Router />
        </App>
    </ConfigProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(
    <StrictMode>
        <MainApp />
    </StrictMode>
)
// 关闭loading
const firstElement = document.getElementById('first')
if (firstElement && firstElement.style?.display !== 'none') {
    firstElement.style.display = 'none'
}
