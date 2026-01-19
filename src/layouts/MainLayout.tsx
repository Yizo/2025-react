import { Layout, theme } from 'antd'
import StaticLayout from './StaticLayout'
import BaseHeader from '@/layouts/BaseHeader'
import BaseFooter from '@/layouts/BaseFooter'

const { Content } = Layout

const ManageLayout = () => {

    const { token } = theme.useToken()

    console.log(token)

    return (
        <Layout className="flex" style={{ height: '100vh' }}>
            <BaseHeader />
            <Content className="mx-6 mt-6 bg-white rounded-lg shadow-md">
                <StaticLayout />
            </Content>
            <BaseFooter />
        </Layout>
    );
};

export default ManageLayout;
