import React, { useState, useMemo } from 'react';
import { View, TextInput, Button, SectionList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLazyQuery } from '@apollo/client';
import { SearchDocument, SearchQuery, SearchQueryVariables } from 'shared/src/types';
import { useDocumentStore } from '../state/documentStore';

export default function Search({ navigation, route }) {
  const { workspaceUri } = route.params;
  const [query, setQuery] = useState('');
  const [fetchSearch, { data, loading }] = useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument);
  const setEditorAction = useDocumentStore(state => state.setEditorAction);

  const sections = useMemo(() => {
    if (!data?.search) return [] as { title: string; data: SearchQuery['search'] }[];
    const grouped = data.search.reduce<Record<string, SearchQuery['search']>>((acc, item) => {
      (acc[item.file] = acc[item.file] || []).push(item);
      return acc;
    }, {});
    return Object.entries(grouped).map(([file, items]) => ({ title: file, data: items }));
  }, [data]);

  const handlePress = (item: SearchQuery['search'][0]) => {
    setEditorAction({ type: 'highlight-line', payload: { line: item.line } });
    navigation.navigate('Explorer', { screen: 'Editor', params: { path: item.file } });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for code..."
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={() => fetchSearch({ variables: { workspaceUri, query } })}
      />
      <Button title="Search" onPress={() => fetchSearch({ variables: { workspaceUri, query } })} disabled={loading || !query} />
      {loading && <ActivityIndicator />}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.file}:${item.line}:${index}`}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.section}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.result} onPress={() => handlePress(item)}>
            <Text style={styles.lineNumber}>{item.line}:</Text>
            <Text style={styles.lineText} numberOfLines={1}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 8 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
    section: { paddingVertical: 4, backgroundColor: '#f0f0f0', fontWeight: 'bold' },
    result: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    lineNumber: { width: 40, textAlign: 'right', marginRight: 8, color: '#888', fontFamily: 'monospace' },
    lineText: { flex: 1, fontFamily: 'monospace' },
});
