import { createBrowserRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import useStaticRoutes from './UserRouter';
import adminRoutes from './adminRoter';
import StaticRouter from './StaticRouter';
import ErrorRouter from './ErrorRouter';
import { useMemo } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthRouter from './AuthRouter';
/**
 * 实现动态路由+静态路由+错误路由
 */
export default function App() {
  const allRoutes = useMemo((): RouteObject[] => {
    const router = [
      {
        element: <AuthRouter />,
        errorElement: <ErrorBoundary />,
        children: [...useStaticRoutes, ...adminRoutes],
      },
    ];

    return [...StaticRouter, ...router, ...ErrorRouter];
  }, []);

  const router = useMemo(() => {
    const base = import.meta.env.VITE_BASE;
    return createBrowserRouter(allRoutes, {
      basename: base,
    });
  }, [allRoutes]);

  return <RouterProvider router={router} />;
}
