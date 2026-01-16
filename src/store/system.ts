import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

const SystemMap = {
  demo: 'demo',
  system: 'system',
}

export type System = keyof typeof SystemMap

interface SystemStateBase {
  systemName: System
  theme: 'light' | 'dark'
}

interface SystemStore extends SystemStateBase {
  set: (data: Partial<SystemStateBase>) => void
}

const initialState: SystemStateBase = {
  systemName: 'demo',
  theme: 'light',
}

const useSystemStore = create<SystemStore>()(
  persist(
    immer(
      devtools(
        (set) => ({
          ...initialState,
          set: (data: Partial<SystemStore>) =>
            set((state) => {
              Object.assign(state, data)
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
)

export const useSystemName = () => useSystemStore((s) => s.systemName)

export const useTheme = () => useSystemStore((s) => s.theme)

export const useSystemActions = () => useSystemStore((s) => s.set)

export default useSystemStore
