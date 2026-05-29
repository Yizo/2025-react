import type { RouteObject } from 'react-router';
import type { ReactNode } from 'react';
import { match } from 'path-to-regexp';

export interface MenuItem {
  key: string;
  label: string | ReactNode;
  title: string | ReactNode;
  index: 0 | 1; // 是否为默认路由
  icon?: ReactNode;
  children?: MenuItem[];
}
/**
 * 将路由对象序列化，去除React元素，只保留可序列化的配置
 * @param routes 路由配置
 * @returns 可序列化的路由配置
 */
export function serializeRoutes(routes: RouteObject[]): RouteObject[] {
  return routes.map((route: RouteObject) => ({
    ...route,
    element: undefined, // 移除React元素
    children: route.children ? serializeRoutes(route.children) : undefined,
  })) as RouteObject[];
}

/**
 * 将路由转换为Menu组件的菜单参数
 * 1. 有title的才添加到菜单中
 */
export function routesToAntdMenu(routes: RouteObject[]): MenuItem[] {
  const result: MenuItem[] = [];

  function handle(route: RouteObject, parentPath = '', parentItem: MenuItem | null = null) {
    const fullPath = route.path
      ? route.path.startsWith('/')
        ? route.path
        : // 将多个斜杠替换为单个斜杠
          `${parentPath}/${route.path}`.replace(/\/+/g, '/')
      : parentPath;

    const menuItem: MenuItem = {
      key: fullPath,
      label: route.handle?.title ?? '',
      title: route.handle?.title ?? '',
      index: route.index ? 1 : 0,
    };

    // 如果路由有标签，则添加到菜单中，否则不添加
    if (route.handle && route.handle.title) {
      if (parentItem) {
        if (!parentItem.children) {
          parentItem.children = [];
        }
        parentItem.children.push(menuItem);
      } else {
        result.push(menuItem);
      }
    }

    const children = (route.children || []).filter((item) => item.handle && item.handle.title);
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        handle(children[i], fullPath, menuItem.label ? menuItem : null);
      }
    }
  }

  for (let i = 0; i < routes.length; i++) {
    handle(routes[i]);
  }

  return result;
}

/**
 * 匹配菜单key, 可匹配动态路由, 如: /admin/:id
 * @param menuKey 菜单key
 * @param pathname 路径
 * @returns 是否匹配
 */
function matchMenuPath(menuKey: string, pathname: string): boolean {
  if (match(menuKey, { decode: decodeURIComponent, end: true })(pathname)) {
    return true;
  }
  // 详情页高亮父级菜单，如 /admin/monitor/1 → /admin/monitor
  return pathname.startsWith(`${menuKey}/`);
}

/**
 * 查找当前地址匹配的菜单项
 * @param menus 菜单
 * @param pathname 路径
 * @param parentKeys 父级菜单key
 * @returns 当前激活菜单
 */
export function findActiveMenu(menus: MenuItem[], pathname: string): MenuItem | null {
  if (!menus || menus.length === 0) return null;
  if (!pathname) return null;
  for (const menu of menus) {
    if (menu.key && matchMenuPath(menu.key, pathname)) {
      if (menu.children && menu.children.length > 0) {
        const indexChild = menu.children.find((c) => c.index === 1);
        if (indexChild) {
          // 递归下去，处理 index 子节点
          return findActiveMenu(menu.children, pathname) || indexChild;
        }
      }
      return menu;
    }
    if (menu.children) {
      const result = findActiveMenu(menu.children, pathname);
      if (result) return result;
    }
  }

  return null;
}
