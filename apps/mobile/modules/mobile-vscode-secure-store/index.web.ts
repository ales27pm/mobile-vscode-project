const UNSUPPORTED_MESSAGE =
  'MobileVSCode secure session storage is unavailable on web. Use an iOS or Android development build.';

export async function getItemAsync(_key: string): Promise<string | null> {
  return null;
}

export async function setItemAsync(_key: string, _value: string): Promise<void> {
  throw new Error(UNSUPPORTED_MESSAGE);
}

export async function deleteItemAsync(_key: string): Promise<void> {
  // Nothing is persisted on web.
}
