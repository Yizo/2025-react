import { lazy } from 'react'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router'
import { LazyImport, StaticLayout } from '@/components'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LazyImport lazy={lazy(() => import('@/components/baseLayout'))} />,
    children: [
      {
        path: 'state',
        handle: {
          label: '数据状态',
          title: '数据状态',
        },
        element: <StaticLayout />,
        children: [
          {
            index: true,
            path: 'useState',
            handle: {
              label: 'useState',
              title: 'useState',
            },
            element: <LazyImport lazy={lazy(() => import('@/pages/useState'))} />,
          },
          {
            path: 'useReducer',
            handle: {
              label: 'useReducer',
              title: 'useReducer',
            },
            element: <LazyImport lazy={lazy(() => import('@/pages/useReducer'))} />,
          },
        ],
      },
      {
        path: 'useReducer',
        handle: {
          label: '状态管理',
          title: '状态管理',
        },
        element: <StaticLayout />,
        children: [
          {
            index: true,
            path: 'useRef',
            handle: {
              label: 'useRef',
              title: 'useRef',
            },
            element: <LazyImport lazy={lazy(() => import('@/pages/useRef'))} />,
          },
          {
            path: 'useContent',
            handle: {
              label: 'useContent',
              title: 'useContent',
            },
            element: <LazyImport lazy={lazy(() => import('@/pages/useContent'))} />,
          },
        ],
      },
      {
        path: 'useSyncExternalStore',
        handle: {
          label: '订阅状态',
          title: '订阅状态',
        },
        Component: lazy(() => import('@/pages/useSyncExternalStore')),
      },
    ],
  },
  {
    path: '*',
    Component: lazy(() => import('@/pages/NotFound')),
  },
]

export type MenuItem = {
  key: string
  label: string | ReactNode
  title: string
  children?: MenuItem[]
}

function routesToAntdMenu(routes: RouteObject[]): MenuItem[] {
  const result: MenuItem[] = []

  function handle(route: RouteObject, parentPath = '', parentItem: MenuItem | null = null) {
    const fullPath = route.path
      ? route.path.startsWith('/')
        ? route.path
        : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
      : parentPath

    const menuItem: MenuItem = {
      key: fullPath,
      label: route.handle?.label ?? '',
      title: route.handle?.title ?? '',
    }

    if (route.handle && route.handle.label) {
      if (parentItem) {
        if (!parentItem.children) {
          parentItem.children = []
        }
        parentItem.children.push(menuItem)
      } else {
        result.push(menuItem)
      }
    }

    const children = (route.children || []).filter((item) => item.handle && item.handle.label)
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        handle(children[i], fullPath, menuItem.label ? menuItem : null)
      }
    }
  }

  for (let i = 0; i < routes.length; i++) {
    handle(routes[i])
  }

  return result
}

export const menus = routesToAntdMenu(routes)

console.log('页面路由', menus)
