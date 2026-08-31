import { useEffect, useMemo, useState } from 'react';
import { useLocation as useRouterLocation } from 'react-router';
import type { MenuItem } from '@/utils/menu.util';

interface ActiveMenuResult {
  currentKey: string;
  openKeys: string[];
}

function normalizePath(pathname: string) {
  const base = import.meta.env.VITE_BASE;
  if (base && base !== '/' && pathname.startsWith(base)) {
    return pathname.slice(base.length) || '/';
  }
  return pathname;
}

function resolveActiveMenu(menus: MenuItem[], pathname: string): ActiveMenuResult {
  let activeKey = '';
  let activeParents: string[] = [];

  function visit(items: MenuItem[], parents: string[]) {
    for (const item of items) {
      const matches =
        item.key.startsWith('/') && (pathname === item.key || pathname.startsWith(`${item.key}/`));

      if (matches && item.key.length >= activeKey.length) {
        activeKey = item.key;
        activeParents = parents;
      }
      if (item.children) visit(item.children, [...parents, item.key]);
    }
  }

  visit(menus, []);
  return { currentKey: activeKey, openKeys: [...new Set(activeParents)] };
}

export default function useActiveMenu(menus: MenuItem[]) {
  const location = useRouterLocation();
  const pathname = normalizePath(location.pathname);
  const active = useMemo(() => resolveActiveMenu(menus, pathname), [menus, pathname]);
  const [currentKey, setCurrentKey] = useState('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    setCurrentKey(active.currentKey);
    setOpenKeys(active.openKeys);
  }, [active]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return { currentKey, openKeys, setCurrentKey, handleOpenChange };
}
