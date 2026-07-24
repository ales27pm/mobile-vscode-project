import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation } from '@apollo/client';
import { PairWithServerDocument } from 'shared/types';
import { SERVER_ORIGIN } from '../config';
import { useAuthStore } from '../state/authStore';

export default function AuthScreen() {
  const [pairingToken, setPairingToken] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const setToken = useAuthStore(state => state.setToken);
  const [pair, { error, loading }] = useMutation(PairWithServerDocument);

  const normalizedPairingToken = pairingToken.trim().toUpperCase();

  const handlePair = async () => {
    if (!normalizedPairingToken || loading) return;

    setLocalError(null);

    try {
      const response = await pair({
        variables: { pairingToken: normalizedPairingToken },
      });
      const clientToken = response.data?.pairWithServer;

      if (!clientToken) {
        throw new Error('The server did not return a session token.');
      }

      await setToken(clientToken);
    } catch (pairingError) {
      const message = pairingError instanceof Error ? pairingError.message : 'Pairing failed.';
      setLocalError(message);
      console.warn('Pairing failed.', pairingError);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Pairing Token</Text>
      <Text selectable style={styles.server} numberOfLines={1}>
        Server: {SERVER_ORIGIN}
      </Text>
      <TextInput
        style={styles.input}
        value={pairingToken}
        onChangeText={value => {
          setPairingToken(value);
          setLocalError(null);
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="ABC123"
        returnKeyType="go"
        onSubmitEditing={() => void handlePair()}
      />
      {localError || error ? (
        <Text selectable style={styles.error}>{localError ?? error?.message}</Text>
      ) : null}
      <Button
        title={loading ? 'Pairing…' : 'Pair'}
        onPress={() => void handlePair()}
        disabled={loading || !normalizedPairingToken}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 16, marginBottom: 8 },
  server: { color: '#666', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 16,
    borderRadius: 8,
  },
  error: { color: 'red', marginVertical: 8 },
});
