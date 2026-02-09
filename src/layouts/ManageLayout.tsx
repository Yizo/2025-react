import { Layout } from 'antd';
import StaticLayout from './StaticLayout';
import BaseHeader from '@/layouts/BaseHeader';
import BaseFooter from '@/layouts/BaseFooter';
import MangeLayoutLeft from '@/layouts/MangeLayoutLeft';

const { Content } = Layout;

const ManageLayout = () => {
  return (
    <Layout className="flex" style={{ minHeight: '100vh' }}>
      <BaseHeader />
      <Content className="mx-6 mt-6 flex gap-4 ml-auto mr-auto" style={{ minWidth: '900px' }}>
        <MangeLayoutLeft />
        <Content className="flex-1 ml-4">
          <StaticLayout />
        </Content>
      </Content>
      <BaseFooter />
    </Layout>
  );
};

export default ManageLayout;
