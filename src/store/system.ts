import { createSlice } from '@reduxjs/toolkit';

const SystemMap = {
  demo: 'demo',
  system: 'system',
};

export type System = keyof typeof SystemMap;

export interface SystemState {
  systemName: System;
  theme: 'light' | 'dark';
  loading: number;
}

const initialState: SystemState = {
  systemName: 'demo',
  theme: 'light',
  loading: 0,
};

export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setSystemName: (state, action) => {
      state.systemName = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setSystem: (state, action) => {
      const { systemName, theme } = action.payload;
      if (systemName !== undefined) state.systemName = systemName;
      if (theme !== undefined) state.theme = theme;
    },
    addLoading: (state) => {
      state.loading++;
    },
    removeLoading: (state) => {
      const current = state.loading - 1;
      state.loading = Math.max(0, current);
    },
    resetLoading: (state) => {
      state.loading = 0;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setSystemName,
  setTheme,
  setSystem,
  addLoading,
  removeLoading,
  resetLoading,
  toggleTheme,
} = systemSlice.actions;

export default systemSlice.reducer;
