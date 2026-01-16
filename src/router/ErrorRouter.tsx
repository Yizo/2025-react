import { LazyImport } from '@/components'
import type { RouteObject } from 'react-router'

const errorRoutes: RouteObject[] = [
  {
    path: '/404',
    element: <LazyImport lazy={lazy(() => import('@/components/NotFound'))} />,
  },
  {
    path: '*',
    element: <LazyImport lazy={lazy(() => import('@/components/NotFound'))} />,
  },
]

export default errorRoutes
