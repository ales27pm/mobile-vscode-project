import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLazyQuery } from '@apollo/client';
import { SearchDocument } from 'shared/src/types';

export default function Search({ navigation }) {
  const [query, setQuery] = useState('');
  const [fetchSearch, { data, loading }] = useLazyQuery(SearchDocument);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for code..."
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={() => fetchSearch({ variables: { query } })}
      />
      <Button title="Search" onPress={() => fetchSearch({ variables: { query } })} disabled={loading || !query} />
      {loading && <ActivityIndicator />}
      <FlatList
        data={data?.search}
        keyExtractor={(item, i) => `${item.file}:${item.line}:${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.result}
            onPress={()=> navigation.navigate('Explorer', { screen: 'Editor', params: { path: item.file, highlight: item.line } })}
          >
            <Text style={styles.path}>{item.file}:{item.line}</Text>
            <Text numberOfLines={1}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 8 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
    result: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    path: { color: 'gray', fontSize: 12 }
});
