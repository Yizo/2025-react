import { Layout } from 'antd'


export default function BaseHeader() {

    const textColor = 'white'

    return (
        <Layout.Header className="flex items-center justify-between">
            <div className="text-2xl font-bold" style={{ color: textColor }}>
                logo
            </div>
            <div className="text-xl cursor-pointer" style={{ color: textColor }}>
                登录
            </div>
        </Layout.Header>
    )
}