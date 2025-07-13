import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (t: string | null) => void;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
      loadToken: async () => {
        const stored = await AsyncStorage.getItem('token');
        if (stored) set({ token: stored });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => AsyncStorage,
      partialize: state => ({ token: state.token }),
    }
  )
);
