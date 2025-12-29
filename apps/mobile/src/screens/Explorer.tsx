import React from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@apollo/client';
import { ListDirectoryDocument, ListDirectoryQuery, ListDirectoryQueryVariables } from 'shared/src/types';
import Editor from './Editor';

type ExplorerParams = {
  FileList: { workspaceUri?: string; path?: string; title?: string };
  Editor: { workspaceUri?: string; path?: string };
};

type ExplorerRoute = RouteProp<{ Explorer: { workspaceUri?: string } }, 'Explorer'>;

const Stack = createNativeStackNavigator<ExplorerParams>();

type FileListProps = NativeStackScreenProps<ExplorerParams, 'FileList'>;

function FileList({ navigation, route }: FileListProps) {
  const { workspaceUri, path = '' } = route.params || {};
  const normalizedPath = path ?? '';
  const variables: ListDirectoryQueryVariables = { workspaceUri: workspaceUri || '', path: normalizedPath || '' };
  const { data, loading, refetch } = useQuery<ListDirectoryQuery, ListDirectoryQueryVariables>(ListDirectoryDocument, { variables });

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
                  navigation.push('FileList', { workspaceUri, path: item.path, title: item.name });
              } else {
                  navigation.navigate('Editor', { workspaceUri, path: item.path });
              }
          }}
        >
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default function Explorer({ route }: { route?: ExplorerRoute }) {
  const workspaceUri: string = route?.params?.workspaceUri ?? '';

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FileList"
        component={FileList}
        initialParams={{ workspaceUri, path: '' }}
        options={({ route }) => ({ title: route.params?.title || 'Root' })}
      />
      <Stack.Screen
        name="Editor"
        component={Editor as React.ComponentType<any>}
        options={({ route }) => ({ title: route.params?.path?.split('/').pop() })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
    header: { padding: 8, fontWeight: 'bold', backgroundColor: '#f0f0f0' },
    item: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }
});
