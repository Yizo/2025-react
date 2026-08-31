import { LazyImport } from '@/components';
import type { RouteObject } from 'react-router';

const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <LazyImport lazy={lazy(() => import('@/layouts/AdminLayout'))} />,
    handle: {
      title: '管理首页',
    },
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/SystemManagement'))} />,
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
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/RoleManagement'))} />,
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
        children: [
          {
            index: true,
            handle: {
              title: '字典类型',
            },
            element: <LazyImport lazy={lazy(() => import('@/pages/admin/DictionaryManagement'))} />,
          },
          {
            path: 'data/:dictTypeId/:dictType',
            handle: {
              title: '字典数据',
            },
            element: (
              <LazyImport lazy={lazy(() => import('@/pages/admin/DictionaryDataManagement'))} />
            ),
          },
        ],
      },
      {
        path: 'monitor',
        handle: {
          title: '监控异常',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/monitor/list'))} />,
      },
      {
        path: 'monitor/:systemId',
        handle: {
          title: '错误日志',
        },
        element: <LazyImport lazy={lazy(() => import('@/pages/admin/monitor/detail'))} />,
      },
    ],
  },
];

export default adminRoutes;
