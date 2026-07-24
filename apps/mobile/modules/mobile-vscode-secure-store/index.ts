import { requireNativeModule } from 'expo';
import { Platform } from 'react-native';

type NativeSecureStore = {
  getValueWithKeyAsync: (key: string, options: SecureStoreOptions) => Promise<string | null>;
  setValueWithKeyAsync: (value: string, key: string, options: SecureStoreOptions) => Promise<boolean>;
  deleteValueWithKeyAsync: (key: string, options: SecureStoreOptions) => Promise<void>;
};

type SecureStoreOptions = {
  keychainService: string;
  keychainAccessible?: number;
};

const KEY_PATTERN = /^[\w.-]+$/;
const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;
const OPTIONS: SecureStoreOptions = {
  keychainService: 'mobile-vscode.session',
  ...(Platform.OS === 'ios'
    ? { keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY }
    : {}),
};

const nativeStore = requireNativeModule('ExpoSecureStore') as NativeSecureStore;

function validateKey(key: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new Error(
      'Invalid secure-storage key. Keys must contain only alphanumeric characters, ".", "-", and "_".'
    );
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  validateKey(key);
  return nativeStore.getValueWithKeyAsync(key, OPTIONS);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  validateKey(key);
  if (typeof value !== 'string') {
    throw new Error('Secure-storage values must be strings.');
  }

  await nativeStore.setValueWithKeyAsync(value, key, OPTIONS);
}

export async function deleteItemAsync(key: string): Promise<void> {
  validateKey(key);
  await nativeStore.deleteValueWithKeyAsync(key, OPTIONS);
}
