import { Outlet } from 'react-router';
import { LazyImport } from '@/components';
import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';

const staticRoutes: RouteObject[] = [
  {
    path: '',
    // 重定向到登录页面
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/home',
    element: <LazyImport lazy={lazy(() => import('@/layouts/MainLayout'))} />,
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/Home'))} />,
      },
    ],
  },
  {
    path: '/login',
    element: <LazyImport lazy={lazy(() => import('@/pages/Login'))} />,
  },
  {
    path: '/color',
    element: <LazyImport lazy={lazy(() => import('@/pages/Color'))} />,
  },
  {
    path: '/test',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/test/rxjs'))} />,
      },
    ],
  },
  {
    path: '/three',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/three/index'))} />,
      },
    ],
  },
  // 业务系统初始化
  {
    path: '/system-init',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/system/init/index'))} />,
      },
    ],
  },
];

export default staticRoutes;
