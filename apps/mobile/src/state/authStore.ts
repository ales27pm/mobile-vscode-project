import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'mobile-vscode.auth-token';

interface AuthState {
  token: string | null;
  isHydrated: boolean;
  setToken: (token: string | null) => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isHydrated: false,

  setToken: async token => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      set({ token, isHydrated: true });
      return;
    }

    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } finally {
      set({ token: null, isHydrated: true });
    }
  },

  loadToken: async () => {
    if (get().isHydrated) return;

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      set({ token });
    } catch (error) {
      console.warn('Unable to load the MobileVSCode session token.', error);
      set({ token: null });
    } finally {
      set({ isHydrated: true });
    }
  },
}));
