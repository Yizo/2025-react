/**
 * 获取当前激活路由
 */
import { useLocation, useMatches, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { findActiveMenu } from '@/utils/menu.util';
import type { MenuItem } from '@/utils/menu.util';

export default function useCurrentPath(menus: MenuItem[]) {
  const location = useLocation();
  const matches = useMatches();
  const navigate = useNavigate();
  const [currentKey, setCurrentKey] = useState<string>('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 第一次匹配后跳转到对应路由
  const hasNavigated = useRef(false);

  const activePathKeys = useMemo(() => {
    return matches.map((match) => match.pathname).filter((key) => key !== '/');
  }, [matches]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    const activeMenu = findActiveMenu(menus, location.pathname);
    setCurrentKey(activeMenu ? activeMenu.key : '');
    if (!hasNavigated.current && activeMenu) {
      navigate(activeMenu.key);
      hasNavigated.current = true;
    }
  }, [menus, location.pathname]);

  useEffect(() => {
    setOpenKeys(activePathKeys);
  }, [activePathKeys]);

  return { currentKey, openKeys, setCurrentKey, handleOpenChange };
}
