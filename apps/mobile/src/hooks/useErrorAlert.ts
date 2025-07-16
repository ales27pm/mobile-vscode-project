import { Alert } from 'react-native';
import { useCallback } from 'react';

export function useErrorAlert(message: string) {
  return useCallback((err: unknown) => {
    console.error(err);
    Alert.alert(message);
  }, [message]);
}
