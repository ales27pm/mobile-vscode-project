import React from 'react';
import { SectionList, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQuery } from '@apollo/client';
import { ListDirectoryDocument } from 'shared/src/types';
import Editor from './Editor';

const Stack = createNativeStackNavigator();

function FileList({ navigation, route }) {
  const path = route.params?.path || '';
  const { data, loading, refetch } = useQuery(ListDirectoryDocument, { variables: { path } });

  if (loading) return <ActivityIndicator style={StyleSheet.absoluteFill} />;

  const files = data?.listDirectory?.filter(f => !f.isDirectory) ?? [];
  const dirs = data?.listDirectory?.filter(f => f.isDirectory) ?? [];

  return (
    <SectionList
      sections={[ { title: 'Directories', data: dirs }, { title: 'Files', data: files } ]}
      keyExtractor={item => item.path}
      onRefresh={refetch}
      refreshing={loading}
      renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item}
          onPress={() => {
              if (item.isDirectory) {
                  navigation.push('FileList', { path: item.path, title: item.name });
              } else {
                  navigation.navigate('Editor', { path: item.path });
              }
          }}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default function Explorer() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FileList"
        component={FileList}
        initialParams={{ path: '' }}
        options={({ route }) => ({ title: route.params?.title || 'Root' })}
      />
      <Stack.Screen
        name="Editor"
        component={Editor}
        options={({ route }) => ({ title: route.params?.path?.split('/').pop() })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
    header: { padding: 8, fontWeight: 'bold', backgroundColor: '#f0f0f0' },
    item: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }
});
