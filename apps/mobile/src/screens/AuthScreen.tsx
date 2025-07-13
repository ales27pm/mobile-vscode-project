import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useMutation } from '@apollo/client';
import { PairWithServerDocument } from 'shared/src/types';
import { useAuthStore } from '../state/authStore';

export default function AuthScreen() {
  const [token, setTokenInput] = useState('');
  const setToken = useAuthStore(s => s.setToken);
  const [pair, { error, loading }] = useMutation(PairWithServerDocument);

  const handlePair = async () => {
    try {
      const res = await pair({ variables: { pairingToken: token } });
      const newToken = res.data?.pairWithServer;
      if (newToken) setToken(newToken);
    } catch (err) {
      console.warn('Pairing failed', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Pairing Token</Text>
      <TextInput style={styles.input} value={token} onChangeText={setTokenInput} autoCapitalize="characters" />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title={loading ? 'Pairing...' : 'Pair'} onPress={handlePair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
  },
  error: { color: 'red', marginVertical: 8 },
});
