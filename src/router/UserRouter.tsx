import { LazyImport } from '@/components'
import type { RouteObject } from 'react-router'

const useStaticRoutes: RouteObject[] = [
  {
    path: '/manage',
    element: <LazyImport lazy={lazy(() => import('@/layouts/ManageLayout'))} />,
    children: [
      {
        index: true,
        element: <LazyImport lazy={lazy(() => import('@/pages/manage/List'))} />,
      },
      {
        path: 'star',
        element: <LazyImport lazy={lazy(() => import('@/pages/manage/Star'))} />,
      },
      {
        path: 'trash',
        element: <LazyImport lazy={lazy(() => import('@/pages/manage/Trash'))} />,
      }
    ]
  },
  {
    path: '/question',
    element: <LazyImport lazy={lazy(() => import('@/layouts/QuestionLayout'))} />,
    children: [
      {
        path: 'edit/:id',
        element: <LazyImport lazy={lazy(() => import('@/pages/question/Edit'))} />,
      },
      {
        path: 'stat/:id',
        element: <LazyImport lazy={lazy(() => import('@/pages/question/Stat'))} />,
      }
    ]
  }
]

export default useStaticRoutes