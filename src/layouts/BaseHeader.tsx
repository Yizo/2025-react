import { Layout } from 'antd';
import UserProfileDropdown from '@/components/UserProfileDropdown';

export default function BaseHeader() {
  return (
    <Layout.Header className="flex items-center justify-between">
      <div className="text-2xl font-bold">logo</div>
      <UserProfileDropdown />
    </Layout.Header>
  );
}
