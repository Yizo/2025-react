import { LazyImport } from '@/components'
import type { RouteObject } from 'react-router'

const useStaticRoutes: RouteObject[] = [
    {
        path: '/manage',
        element: <LazyImport lazy={lazy(() => import('@/layouts/ManageLayout'))} />,
        children: [
            {
                index: true,
                handle: {
                    title: '我的问卷',
                },
                element: <LazyImport lazy={lazy(() => import('@/pages/manage/List'))} />,
            },
            {
                path: 'star',
                handle: {
                    title: '星标问卷',
                },
                element: <LazyImport lazy={lazy(() => import('@/pages/manage/Star'))} />,
            },
            {
                path: 'trash',
                handle: {
                    title: '回收站',
                },
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
                handle: {
                    title: '编辑问卷',
                },
                element: <LazyImport lazy={lazy(() => import('@/pages/question/Edit'))} />,
            },
            {
                path: 'stat/:id',
                handle: {
                    title: '问卷统计',
                },
                element: <LazyImport lazy={lazy(() => import('@/pages/question/Stat'))} />,
            }
        ]
    }
]

export default useStaticRoutes