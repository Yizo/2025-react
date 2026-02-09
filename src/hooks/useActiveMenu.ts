/**
 * 获取当前激活路由
 */
import { useLocation, useMatches } from 'react-router';
import { useState, useEffect } from 'react';
import { findActiveMenu } from '@/utils/menu.util';
import type { MenuItem } from '@/utils/menu.util';

export default function useCurrentPath(menus: MenuItem[]) {
  const location = useLocation();
  const [currentKey, setCurrentKey] = useState<string>('');
  const matches = useMatches();
  console.log('matches', matches);
  const openKeys = useMemo(() => {
    const keys = matches.map((match) => match.pathname).filter((key) => key !== '/');
    keys.pop();
    console.log('keys', keys);
    return keys;
  }, [matches]);
  useEffect(() => {
    const activeMenu = findActiveMenu(menus, location.pathname);
    setCurrentKey(activeMenu ? activeMenu.key : '');
  }, [menus, location.pathname]);

  return { currentKey, openKeys, setCurrentKey };
}
