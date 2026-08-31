import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import { useAppDispatch } from './index';
import { resetRoutes } from './menu';

export interface UserState {
  userInfo: null | Record<string, any>;
  token: null | string;
}

const initialState: UserState = {
  userInfo: null,
  token: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      const { userInfo, token } = action.payload;
      if (userInfo !== undefined) state.userInfo = userInfo;
      if (token !== undefined) state.token = token;
    },
    clearUser: (state) => {
      state.userInfo = null;
      state.token = null;
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
    },
  },
});

export function useLogin() {
  const dispatch = useAppDispatch();
  function onLogin(values: any) {
    const name =
      typeof values?.username === 'string' && values.username.trim()
        ? values.username.trim()
        : '管理员';
    dispatch(
      setUser({
        // admin-api 当前是公开脚手架，尚未提供登录接口；保留前端会话以便进入管理页面。
        token: 'admin-api-local-session',
        userInfo: {
          id: 0,
          name,
        },
      })
    );
  }

  return { onLogin, loading: false };
}

export function useLogout() {
  const dispatch = useAppDispatch();
  function onLogout() {
    dispatch(clearUser());
    dispatch(resetRoutes());
  }

  return { onLogout, loading: false };
}

export const { setUserInfo, setToken, setUser, clearUser, logout } = userSlice.actions;

const userPersistConfig = {
  key: import.meta.env.VITE_STORAGE_KEY + '_user',
  storage: sessionStorage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice.reducer);

export default persistedUserReducer;
