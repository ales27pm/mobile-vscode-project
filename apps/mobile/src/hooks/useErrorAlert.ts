import { Alert } from 'react-native';
import { useCallback } from 'react';

export function useErrorAlert(message: string) {
  return useCallback((err: unknown) => {
    console.error(err);
    let errorMessage = '';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else {
      errorMessage = JSON.stringify(err);
    }
    Alert.alert(message, errorMessage);
  }, [message]);
}
