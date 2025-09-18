import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface State {
	user: {
		id: string;
		name: string;
		token: string;
		role: number[];
	};
}

type Actions = {
	setUser: (user: State["user"]) => void;
	getUser: () => State["user"];
	setToken: (token: string) => void;
	clearUser: () => void;
};

const useUserStore = create<State & Actions>()(
	immer(
		persist(
			(set, get) => {
				const store = {
					user: {
						id: "",
						name: "",
						token: "",
						role: [],
					},
					setUser: (user: State["user"]) =>
						set((state) => {
							state.user = user;
						}),
					getUser: () => get().user,
					setToken: (token: string) =>
						set((state) => {
							state.user.token = token;
						}),
					clearUser: () =>
						set((state) => {
							state.user = {
								id: "",
								name: "",
								token: "",
								role: [],
							};
						}),
				};

				return store;
			},
			{
				name: "user",
				storage: createJSONStorage(() => sessionStorage),
			}
		)
	)
);

// 在这里订阅并监听状态变化
useUserStore.subscribe((state, previousState) => {
	if (state.user !== previousState.user) {
		console.log("User has changed:", state.user);
	}
});

export default useUserStore;
