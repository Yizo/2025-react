import { Outlet, useNavigate } from 'react-router';
import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  BookOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { useAppSelector } from '@/store';
import BaseFooter from './BaseFooter';
import useActiveMenu from '@/hooks/useActiveMenu';
import type { ItemType } from 'antd/es/menu/interface';

const sidebarItems = [
  {
    key: '/admin/menu',
    icon: <MenuOutlined />,
    label: '菜单管理',
  },
  {
    key: '/admin/user',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/admin/role',
    icon: <TeamOutlined />,
    label: '角色管理',
  },
  {
    key: '/admin/department',
    icon: <ApartmentOutlined />,
    label: '部门管理',
  },
  {
    key: '/admin/dictionary',
    icon: <BookOutlined />,
    label: '字典管理',
  },
  {
    key: '/admin/logs',
    icon: <FileTextOutlined />,
    label: '系统日志',
  },
];

export default function AdminLayout() {
  const systemTheme = useAppSelector((state) => state.system.theme);
  const menus = useAppSelector((state) => state.menu.adminMenus);
  const navigate = useNavigate();

  const { currentKey, openKeys } = useActiveMenu(menus);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header className="flex items-center justify-between">
        <div className="text-2xl font-bold">logo</div>
        <UserProfileDropdown />
      </Layout.Header>
      <Layout>
        <Layout.Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          theme={systemTheme}
        >
          <Menu
            mode="inline"
            items={menus as ItemType[]}
            openKeys={openKeys}
            onClick={({ key }) => navigate(key)}
            className="border-r-0"
            theme={systemTheme}
            selectedKeys={currentKey ? [currentKey] : []}
            defaultSelectedKeys={currentKey ? [currentKey] : []}
          />
        </Layout.Sider>

        {/* Content */}
        <Layout>
          <Layout.Content>
            <Outlet />
          </Layout.Content>
          <BaseFooter />
        </Layout>
      </Layout>
    </Layout>
  );
}
