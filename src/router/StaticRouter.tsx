import { LazyImport } from '@/components'
import { Navigate } from 'react-router'
import type { RouteObject } from 'react-router'


const staticRoutes: RouteObject[] = [
  {
    path: '',
    // 重定向到登录页面
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/home',
    element: <LazyImport lazy={lazy(() => import('@/pages/Home'))} />,
  },
  {
    path: '/login',
    element: <LazyImport lazy={lazy(() => import('@/pages/Login'))} />,
  },
  {
    path: '/register',
    element: <LazyImport lazy={lazy(() => import('@/pages/Register'))} />,
  }
]

export default staticRoutes
