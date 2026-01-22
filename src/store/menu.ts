import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RouteObject } from 'react-router';
import type { ReactNode } from 'react';

export interface MenuState {
  routes: RouteObject[];
  menus: MenuItem[];
}

export type MenuItem = {
  key: string;
  label: string | ReactNode;
  title: string;
  children?: MenuItem[];
};

type PageFiles = Record<string, () => Promise<any>>;

// 异步获取菜单数据
export const getMenusAsync = createAsyncThunk('menu/getMenus', async () => {
  const pages = import.meta.glob('@/pages/**/*.tsx', { eager: false }) as PageFiles;
  console.log('pages', pages);
  // 这里可以根据实际需求处理页面文件
  return [];
});

function routesToAntdMenu(routes: RouteObject[]): MenuItem[] {
  const result: MenuItem[] = [];

  function handle(route: RouteObject, parentPath = '', parentItem: MenuItem | null = null) {
    const fullPath = route.path
      ? route.path.startsWith('/')
        ? route.path
        : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
      : parentPath;

    const menuItem: MenuItem = {
      key: fullPath,
      label: route.handle?.label ?? '',
      title: route.handle?.title ?? '',
    };

    if (route.handle && route.handle.label) {
      if (parentItem) {
        if (!parentItem.children) {
          parentItem.children = [];
        }
        parentItem.children.push(menuItem);
      } else {
        result.push(menuItem);
      }
    }

    const children = (route.children || []).filter((item) => item.handle && item.handle.label);
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

const initialState: MenuState = {
  routes: [],
  menus: [],
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setRoutes: (state, action) => {
      state.routes = action.payload;
      state.menus = routesToAntdMenu(action.payload);
    },
    resetRoutes: (state) => {
      state.routes = [];
      state.menus = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMenusAsync.fulfilled, (state, action) => {
      state.routes = action.payload;
      state.menus = routesToAntdMenu(action.payload);
    });
  },
});

export const { setRoutes, resetRoutes } = menuSlice.actions;
export default menuSlice.reducer;
