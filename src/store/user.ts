import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/lib/storage/session';
import { useRequest } from 'ahooks';
import { useDispatch } from 'react-redux';
import { request } from '@/services';

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
  const dispatch = useDispatch();
  const { runAsync, loading } = useRequest(
    async (values: any) => {
      const result = await request.post('/api/auth/login', values);
      return result;
    },
    {
      manual: true,
    }
  );

  async function onLogin(values: any) {
    const result = await runAsync(values);
    console.log('result', result);
    const { data, message } = result;
    console.log('登录成功:', data, message);
    dispatch(
      setUser({
        token: data.accessToken,
        userInfo: {
          id: data.user.id,
          name: data.user.username,
        },
      })
    );
  }

  return { onLogin, loading };
}

export function useLogout() {
  const dispatch = useDispatch();
  const { runAsync, loading } = useRequest(
    async () => {
      const result = await request.get('/api/auth/logout');
      return result;
    },
    {
      manual: true,
    }
  );

  async function onLogout() {
    const result = await runAsync();
    console.log('result', result);
    const { data, message } = result;
    console.log('退出成功:', data, message);
    dispatch(clearUser());
  }

  return { onLogout, loading };
}

export const { setUserInfo, setToken, setUser, clearUser, logout } = userSlice.actions;

const userPersistConfig = {
  key: import.meta.env.VITE_STORAGE_KEY + '_user',
  storage: sessionStorage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice.reducer);

export default persistedUserReducer;
