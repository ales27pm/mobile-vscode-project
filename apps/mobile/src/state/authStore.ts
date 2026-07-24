import { deleteItemAsync, getItemAsync, setItemAsync } from '../../modules/mobile-vscode-secure-store';
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
      await setItemAsync(TOKEN_KEY, token);
      set({ token, isHydrated: true });
      return;
    }

    try {
      await deleteItemAsync(TOKEN_KEY);
    } finally {
      set({ token: null, isHydrated: true });
    }
  },

  loadToken: async () => {
    if (get().isHydrated) return;

    try {
      const token = await getItemAsync(TOKEN_KEY);
      set({ token });
    } catch (error) {
      console.warn('Unable to load the MobileVSCode session token.', error);
      set({ token: null });
    } finally {
      set({ isHydrated: true });
    }
  },
}));
