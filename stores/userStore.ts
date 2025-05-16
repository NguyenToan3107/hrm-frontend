import { User } from "@/core/entities/models/user.model";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserState {
  user: User;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: {},
      setUser: (user: User) => set((state) => ({ ...state, user: user })),
    }),
    { name: "user" }
  )
);
