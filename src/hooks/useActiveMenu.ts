/**
 * 获取当前激活路由
 */
import { useLocation, useMatches } from 'react-router';
import { useState, useEffect } from 'react';
import { findActiveMenu } from '@/utils/menu.util';
import type { MenuItem } from '@/utils/menu.util';

export default function useCurrentPath(menus: MenuItem[]) {
  const location = useLocation();
  const matches = useMatches();
  const [currentKey, setCurrentKey] = useState<string>('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const activePathKeys = useMemo(() => {
    const keys = matches.map((match) => match.pathname).filter((key) => key !== '/');
    return keys;
  }, [matches]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    const activeMenu = findActiveMenu(menus, location.pathname);
    setCurrentKey(activeMenu ? activeMenu.key : '');
  }, [menus, location.pathname]);

  useEffect(() => {
    setOpenKeys(activePathKeys);
  }, [activePathKeys]);

  return { currentKey, openKeys, setCurrentKey, handleOpenChange };
}
