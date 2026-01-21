import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

const SystemMap = {
  demo: 'demo',
  system: 'system',
};

export type System = keyof typeof SystemMap;

interface SystemStateBase {
  systemName: System;
  theme: 'light' | 'dark';
  loading: number;
}

interface SystemStore extends SystemStateBase {
  set: (data: Partial<SystemStateBase>) => void;
  addLoading: () => void;
  removeLoading: () => void;
}

const initialState: SystemStateBase = {
  systemName: 'demo',
  theme: 'light',
  loading: 0,
};

const useSystemStore = create<SystemStore>()(
  persist(
    immer(
      devtools(
        (set) => ({
          ...initialState,
          set: (data: Partial<SystemStore>) =>
            set((state) => {
              Object.assign(state, data);
            }),
          addLoading: () =>
            set((state) => {
              state.loading++;
            }),
          removeLoading: () =>
            set((state) => {
              const current = state.loading - 1;
              state.loading = Math.max(0, current);
            }),
        }),
        {
          enabled: true,
          name: '系统信息',
        }
      )
    ),
    {
      name: 'system-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useSystemName = () => useSystemStore((s) => s.systemName);

export const useTheme = () => useSystemStore((s) => s.theme);

export const useSystemActions = () => useSystemStore((s) => s.set);

export const useLoading = () => useSystemStore((s) => s.loading);

export default useSystemStore;
