import { createBrowserRouter, RouterProvider } from 'react-router'
import type { RouteObject } from 'react-router'
import { useDynamicRoutes } from '@/store/menu'
import StaticRouter from './StaticRouter'
import ErrorRouter from './ErrorRouter'
import { useMemo } from 'react'
import BaseLayout from '@/components/BaseLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

/**
 * 实现动态路由+静态路由+错误路由
 */
export default function App() {
  const dynamicRoutes = useDynamicRoutes()

  // 使用 useMemo 缓存路由配置，避免每次渲染都重新创建
  const allRoutes = useMemo((): RouteObject[] => {
    const router = [
      {
        element: <BaseLayout />,
        errorElement: <ErrorBoundary />,
        children: dynamicRoutes,
      },
    ]

    return [...StaticRouter, ...router, ...ErrorRouter]
  }, [dynamicRoutes])

  const router = useMemo(() => {
    const base = import.meta.env.VITE_BASE
    console.log('base', base)
    console.log('allRoutes', allRoutes)

    return createBrowserRouter(allRoutes, {
      basename: base,
    })
  }, [allRoutes])

  return <RouterProvider router={router} />
}
