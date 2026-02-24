import { LazyImport } from '@/components';
import type { RouteObject } from 'react-router';

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <LazyImport lazy={lazy(() => import('@/layouts/AdminLayout'))} />,
    handle: {
      title: '系统管理',
    },
    children: [
      {
        index: true,
        path: 'menu',
        handle: {
          title: '菜单管理',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/MenuManagement'))} />,
      },
      {
        index: true,
        path: 'menu2',
        handle: {
          title: '菜单管理2',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/menu/index'))} />,
      },
      {
        path: 'user',
        handle: {
          title: '用户管理',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/UserManagement'))} />,
      },
      {
        path: 'role',
        handle: {
          title: '角色管理',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/role/list'))} />,
      },
      {
        path: 'department',
        handle: {
          title: '部门管理',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/DepartmentManagement'))} />,
      },
      {
        path: 'dictionary',
        handle: {
          title: '字典管理',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/dictionary/index'))} />,
      },
      {
        path: 'logs',
        handle: {
          title: '系统日志',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/LogManagement'))} />,
      },
    ],
  },
];

export default adminRoutes;
