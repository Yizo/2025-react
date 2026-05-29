import { createBrowserRouter, RouterProvider } from 'react-router';
import type { RouteObject } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { setAdminRoutes } from '@/store/menu';
import { serializeRoutes } from '@/utils/menu.util';
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
  const dispatch = useAppDispatch();
  const dynamicRoutesFromStore = useAppSelector((state) => state.menu.routes);

  // 静态 admin 路由变更后同步侧栏，避免 session 持久化的旧菜单缺少新项
  useEffect(() => {
    dispatch(setAdminRoutes(serializeRoutes(adminRoutes)));
  }, [dispatch]);

  const dynamicRoutes = useMemo(() => {
    return dynamicRoutesFromStore.length > 0
      ? dynamicRoutesFromStore
      : [...useStaticRoutes, ...adminRoutes];
  }, [dynamicRoutesFromStore]);

  const allRoutes = useMemo((): RouteObject[] => {
    const router = [
      {
        element: <AuthRouter />,
        errorElement: <ErrorBoundary />,
        children: [...dynamicRoutes],
      },
    ];

    return [...StaticRouter, ...router, ...ErrorRouter];
  }, [dynamicRoutes]);

  const router = useMemo(() => {
    const base = import.meta.env.VITE_BASE;
    return createBrowserRouter(allRoutes, {
      basename: base,
    });
  }, [allRoutes]);

  return <RouterProvider router={router} />;
}
