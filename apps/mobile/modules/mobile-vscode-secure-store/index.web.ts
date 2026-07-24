const UNSUPPORTED_MESSAGE =
  'MobileVSCode secure session storage is unavailable on web. The current session will not persist after the app restarts.';

let didWarnAboutUnsupportedStorage = false;

function warnIfUnsupported(): void {
  if (didWarnAboutUnsupportedStorage) return;
  didWarnAboutUnsupportedStorage = true;
  console.warn(UNSUPPORTED_MESSAGE);
}

export async function getItemAsync(_key: string): Promise<string | null> {
  return null;
}

export async function setItemAsync(_key: string, _value: string): Promise<void> {
  warnIfUnsupported();
}

export async function deleteItemAsync(_key: string): Promise<void> {
  // Nothing is persisted on web.
}
