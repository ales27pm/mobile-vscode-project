import React, { useState, useMemo } from 'react';
import { View, TextInput, Button, SectionList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLazyQuery } from '@apollo/client';
import { SearchDocument, SearchQuery, SearchQueryVariables } from 'shared/src/types';
import { useDocumentStore } from '../state/documentStore';

type SearchResultSection = {
  title: string;
  data: SearchQuery['search'];
};

export default function Search({ navigation }) {
  const [query, setQuery] = useState('');
  const [fetchSearch, { data, loading }] = useLazyQuery<SearchQuery, SearchQueryVariables>(SearchDocument);
  const setEditorAction = useDocumentStore(state => state.setEditorAction);

  const sections = useMemo<SearchResultSection[]>(() => {
    if (!data?.search) return [];
    const grouped: Record<string, SearchQuery['search']> = {};
    data.search.forEach(item => {
      if (!grouped[item.file]) grouped[item.file] = [];
      grouped[item.file].push(item);
    });
    return Object.entries(grouped).map(([file, results]) => ({ title: file, data: results }));
  }, [data]);

  const handleResultPress = (item: SearchQuery['search'][0]) => {
    setEditorAction({ type: 'highlight-line', payload: { line: item.line } });
    navigation.navigate('Explorer', { screen: 'Editor', params: { path: item.file } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for code..."
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => fetchSearch({ variables: { query } })}
        />
        <Button title="Search" onPress={() => fetchSearch({ variables: { query } })} disabled={loading || !query} />
      </View>
      {loading && <ActivityIndicator />}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.file}:${item.line}:${index}`}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)}>
            <Text style={styles.lineNumber}>{item.line}:</Text>
            <Text style={styles.lineText} numberOfLines={1}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8, gap: 8 },
  inputContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
  sectionHeader: {
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  resultItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  lineNumber: {
    color: '#888',
    textAlign: 'right',
    width: 40,
    marginRight: 8,
    fontFamily: 'monospace',
  },
  lineText: {
    flex: 1,
    fontFamily: 'monospace',
  },
});
