import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

interface UserStateBase {
  userInfo: null | Record<string, any>
  token: null | string
}

interface UserStore extends UserStateBase {
  set: (data: Partial<UserStateBase>) => void
}

const initialState: UserStateBase = {
  userInfo: null,
  token: '',
}

const useUserStore = create<UserStore>()(
  persist(
    immer(
      devtools(
        (set) => ({
          ...initialState,
          set: (data: Partial<UserStore>) =>
            set((state) => {
              Object.assign(state, data)
            }),
        }),
        {
          enabled: true,
          name: '用户信息',
        }
      )
    ),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const useUserInfo = () => useUserStore((s) => s.userInfo)
export const useToken = () => useUserStore((s) => s.token)
export const useUserActions = () => useUserStore((s) => s.set)

export default useUserStore
