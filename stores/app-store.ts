// Global state store placeholder
import { create } from "zustand";

interface AppState {
  user: null | object;
  setUser: (user: object | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
