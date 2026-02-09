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
  MenuUnfoldOutlined,
  MenuFoldOutlined,
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
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const systemTheme = useAppSelector((state) => state.system.theme);
  const menus = useAppSelector((state) => state.menu.adminMenus);

  const navigate = useNavigate();

  const { currentKey, openKeys, handleOpenChange } = useActiveMenu(menus);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={180}
        theme={systemTheme}
        trigger={null}
      >
        <Menu
          mode="inline"
          items={menus as ItemType[]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={({ key }) => navigate(key)}
          className="border-r-0 h-full"
          theme={systemTheme}
          selectedKeys={currentKey ? [currentKey] : []}
          defaultSelectedKeys={currentKey ? [currentKey] : []}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{ background: colorBgContainer }}
          className="flex items-center justify-between px-4!"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
            }}
          />
          <UserProfileDropdown />
        </Layout.Header>
        <Layout.Content>
          <Outlet />
        </Layout.Content>
        <BaseFooter />
      </Layout>
    </Layout>
  );
}
