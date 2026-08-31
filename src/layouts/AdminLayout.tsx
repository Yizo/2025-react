import { useState } from 'react';
import { Outlet, useMatches, useNavigate } from 'react-router';
import { Breadcrumb, Button, Layout, Menu, theme } from 'antd';
import {
  ApartmentOutlined,
  BookOutlined,
  HomeOutlined,
  MonitorOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import BaseFooter from './BaseFooter';
import useActiveMenu from '@/hooks/useActiveMenu';
import { useAppSelector } from '@/store';
import type { MenuItem } from '@/utils/menu.util';
import type { ItemType } from 'antd/es/menu/interface';

const sidebarItems: MenuItem[] = [
  { key: '/admin', label: '管理首页', title: '管理首页', index: 0, icon: <HomeOutlined /> },
  { key: '/admin/user', label: '用户管理', title: '用户管理', index: 0, icon: <UserOutlined /> },
  { key: '/admin/role', label: '角色管理', title: '角色管理', index: 0, icon: <TeamOutlined /> },
  {
    key: '/admin/department',
    label: '部门管理',
    title: '部门管理',
    index: 0,
    icon: <ApartmentOutlined />,
  },
  {
    key: '/admin/dictionary-menu',
    label: '字典管理',
    title: '字典管理',
    index: 0,
    icon: <BookOutlined />,
    children: [
      {
        key: '/admin/dictionary',
        label: '字典类型',
        title: '字典类型',
        index: 1,
      },
    ],
  },
  {
    key: '/admin/monitor',
    label: '监控异常',
    title: '监控异常',
    index: 0,
    icon: <MonitorOutlined />,
  },
];

export default function AdminLayout() {
  const { token } = theme.useToken();
  const { colorBgContainer } = token;
  const systemTheme = useAppSelector((state) => state.system.theme);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { currentKey, openKeys, handleOpenChange } = useActiveMenu(sidebarItems);
  const breadcrumbItems = useMatches()
    .map((match) => {
      const handle = match.handle as { title?: unknown } | undefined;
      return {
        path: match.pathname,
        title: typeof handle?.title === 'string' ? handle.title : undefined,
      };
    })
    .filter((item): item is { path: string; title: string } => !!item.title)
    .filter(
      (item, index, items) => items.findIndex((candidate) => candidate.path === item.path) === index
    )
    .map((item, index, items) => ({
      title:
        index === items.length - 1 ? (
          item.title
        ) : (
          <a onClick={() => navigate(item.path)}>{item.title}</a>
        ),
    }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={190}
        theme={systemTheme}
        trigger={null}
      >
        <div className="flex h-16 items-center justify-center" style={{ color: token.colorText }}>
          <SettingOutlined className="mr-2" />
          {!collapsed && <span className="font-semibold">admin-api</span>}
        </div>
        <Menu
          mode="inline"
          items={sidebarItems as ItemType[]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
          theme={systemTheme}
          selectedKeys={currentKey ? [currentKey] : []}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{ background: colorBgContainer }}
          className="flex items-center justify-between pl-4! pr-8!"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
            style={{ fontSize: '16px' }}
          />
          <UserProfileDropdown />
        </Layout.Header>
        <Layout.Content>
          {breadcrumbItems.length > 0 && (
            <div className="px-6 pt-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}
          <Outlet />
        </Layout.Content>
        <BaseFooter />
      </Layout>
    </Layout>
  );
}
