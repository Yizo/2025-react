import { create } from 'zustand'
import type { RouteObject } from 'react-router'
import type { ReactNode } from 'react'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

export interface RouteState {
  routes: RouteObject[]
  menus: MenuItem[]
  setRoutes: (routes: RouteObject[]) => void
  resetRoutes: () => void
}

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

export const useRouteStore = create<RouteState>()(
  persist(
    immer(
      devtools(
        (set) => ({
          routes: [],
          menus: [],
          setRoutes: (routes) => {
            set({ routes, menus: routesToAntdMenu(routes) })
          },
          resetRoutes: () => set({ routes: [], menus: [] }),
        }),
        {
          enabled: true,
          name: '菜单信息',
        }
      )
    ),
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const useMenus = () => useRouteStore((s) => s.menus)

export const useDynamicRoutes = () => useRouteStore((s) => s.routes)
