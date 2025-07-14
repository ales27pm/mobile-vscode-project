import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../state/authStore';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string | null> = {};
  return {
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    removeItem: jest.fn(async (k: string) => { delete store[k]; }),
  };
});

describe('authStore', () => {
  test('setToken updates state', () => {
    useAuthStore.getState().setToken('abc');
    expect(useAuthStore.getState().token).toBe('abc');
  });

  test('loadToken reads from storage', async () => {
    // Clear any existing state
    await AsyncStorage.removeItem('token');
    await AsyncStorage.setItem('token', 'stored');
    useAuthStore.setState({ token: null });
    await useAuthStore.getState().loadToken();
    expect(useAuthStore.getState().token).toBe('stored');
  });
});
