import { Menu } from 'antd';
import StaticLayout from './StaticLayout';

export default function BaseLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4 gap-4">
      <div className="flex-none">
        <Menu className="w-full" mode="horizontal" />
      </div>
      <div className="box flex-auto p-4">
        <StaticLayout />
      </div>
    </div>
  );
}
