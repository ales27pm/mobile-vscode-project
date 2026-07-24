import { requireOptionalNativeModule } from 'expo';

type NativeSecureStore = {
  getValueWithKeyAsync: (key: string, options: SecureStoreOptions) => Promise<string | null>;
  setValueWithKeyAsync: (value: string, key: string, options: SecureStoreOptions) => Promise<boolean>;
  deleteValueWithKeyAsync: (key: string, options: SecureStoreOptions) => Promise<void>;
};

type SecureStoreOptions = {
  keychainService: string;
};

const KEY_PATTERN = /^[\w.-]+$/;
const OPTIONS: SecureStoreOptions = {
  keychainService: 'mobile-vscode.session',
};

const nativeStore = requireOptionalNativeModule<NativeSecureStore>('MobileVSCodeSecureStore');
let didWarnAboutUnavailableStore = false;

function validateKey(key: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new Error(
      'Invalid secure-storage key. Keys must contain only alphanumeric characters, ".", "-", and "_".'
    );
  }
}

function warnIfUnavailable(): void {
  if (didWarnAboutUnavailableStore) return;
  didWarnAboutUnavailableStore = true;
  console.warn(
    'MobileVSCode secure session persistence is unavailable in this client. ' +
      'The current session will work, but the device must pair again after the app restarts. ' +
      'Use an iOS or Android development build for Keychain/Keystore persistence.'
  );
}

export async function getItemAsync(key: string): Promise<string | null> {
  validateKey(key);
  if (!nativeStore) {
    warnIfUnavailable();
    return null;
  }
  return nativeStore.getValueWithKeyAsync(key, OPTIONS);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  validateKey(key);
  if (typeof value !== 'string') {
    throw new Error('Secure-storage values must be strings.');
  }

  if (!nativeStore) {
    warnIfUnavailable();
    return;
  }

  await nativeStore.setValueWithKeyAsync(value, key, OPTIONS);
}

export async function deleteItemAsync(key: string): Promise<void> {
  validateKey(key);
  if (!nativeStore) return;
  await nativeStore.deleteValueWithKeyAsync(key, OPTIONS);
}
