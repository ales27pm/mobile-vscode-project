import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useMutation } from "@apollo/client";
import { PairWithServerDocument } from "shared/types";
import { useAuthStore } from "../state/authStore";

export default function AuthScreen() {
  const [token, setTokenInput] = useState("");
  const setToken = useAuthStore((s) => s.setToken);

  // If PairWithServerDocument is ever undefined, Apollo will crash.
  // This import path ("shared") ensures Metro resolves the built dist entry.
  const [pair, { error, loading }] = useMutation(PairWithServerDocument);

  const handlePair = async () => {
    try {
      const res = await pair({ variables: { pairingToken: token } });
      const newToken = res.data?.pairWithServer;
      if (newToken) setToken(newToken);
    } catch (err) {
      console.warn("Pairing failed", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Pairing Token</Text>
      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setTokenInput}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="XXXX-XXXX"
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button title={loading ? "Pairing..." : "Pair"} onPress={handlePair} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 16,
    borderRadius: 8
  },
  error: { color: "red", marginVertical: 8 }
});
