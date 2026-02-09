import { Layout, theme } from 'antd';
import UserProfileDropdown from '@/components/UserProfileDropdown';

export default function BaseHeader() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout.Header
      style={{ background: colorBgContainer }}
      className="flex items-center justify-between"
    >
      <div className="text-2xl font-bold">logo</div>
      <UserProfileDropdown />
    </Layout.Header>
  );
}
