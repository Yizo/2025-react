import { Layout } from 'antd';
import StaticLayout from './StaticLayout';
import BaseHeader from '@/layouts/BaseHeader';
import BaseFooter from '@/layouts/BaseFooter';

const { Content } = Layout;

const ManageLayout = () => {
  return (
    <Layout className="flex" style={{ minHeight: '100vh' }}>
      <BaseHeader />
      <Content className="mx-6 mt-6  rounded-lg shadow-md">
        <StaticLayout />
      </Content>
      <BaseFooter />
    </Layout>
  );
};

export default ManageLayout;
