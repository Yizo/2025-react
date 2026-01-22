import { createSlice } from '@reduxjs/toolkit';

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

export const { setUserInfo, setToken, setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;
