import { create } from 'zustand';

interface DebugState {
  logs: string[];
  isActive: boolean;
  appendLog: (log: string) => void;
  setActive: (active: boolean) => void;
  clearLogs: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  logs: [],
  isActive: false,
  appendLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
  setActive: (active) => set({ isActive: active }),
  clearLogs: () => set({ logs: [] }),
}));
