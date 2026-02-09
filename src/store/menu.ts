import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RouteObject } from 'react-router';
import { routesToAntdMenu } from '@/utils/menu.util';
import adminRoutes from '@/router/adminRoter';
import type { MenuItem } from '@/utils/menu.util';

export interface MenuState {
  routes: RouteObject[];
  menus: MenuItem[];
  adminMenus: MenuItem[];
}

type PageFiles = Record<string, () => Promise<any>>;

// 异步获取菜单数据
export const getUserMenusAsync = createAsyncThunk('menu/getUserMenus', async () => {
  const pages = import.meta.glob('@/pages/**/*.tsx', { eager: false }) as PageFiles;
  console.log('pages', pages);
  // 这里可以根据实际需求处理页面文件
  return [];
});

const initialState: () => MenuState = () => {
  return {
    routes: [],
    // 前台菜单
    menus: [],
    // 后台菜单
    adminMenus: routesToAntdMenu(adminRoutes),
  };
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setUserRoutes: (state, action) => {
      state.routes = action.payload;
      state.menus = routesToAntdMenu(action.payload);
      console.log('state.menus', state.menus);
    },
    setAdminRoutes: (state, action) => {
      state.adminMenus = routesToAntdMenu(action.payload);
    },
    resetRoutes: (state) => {
      state.routes = [];
      state.menus = [];
      state.adminMenus = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserMenusAsync.fulfilled, (state, action) => {
      state.routes = action.payload;
      state.menus = routesToAntdMenu(action.payload);
    });
  },
});

export const { setUserRoutes, setAdminRoutes, resetRoutes } = menuSlice.actions;
export default menuSlice.reducer;
