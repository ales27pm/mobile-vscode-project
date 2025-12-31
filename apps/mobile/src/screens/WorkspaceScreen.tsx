import React from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useQuery } from '@apollo/client';
import { ListWorkspacesDocument, ListWorkspacesQuery } from 'shared/types';
import { useAuthStore } from '../state/authStore';

type WorkspaceScreenProps = { navigation: { replace: (route: string, params: { workspaceUri: string; workspaceName: string }) => void } };

export default function WorkspaceScreen({ navigation }: WorkspaceScreenProps) {
  const { data, loading, error, refetch } = useQuery<ListWorkspacesQuery>(ListWorkspacesDocument);
  const setToken = useAuthStore(s => s.setToken);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (error) return (
      <View style={styles.center}>
          <Text>Error loading workspaces: {error.message}</Text>
          <Button title="Retry" onPress={() => refetch()} />
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data?.listWorkspaces}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => navigation.replace('MainApp', { workspaceUri: item.uri, workspaceName: item.name })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.uri} numberOfLines={1}>{item.uri}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.title}>Select a Workspace</Text>}
        ListFooterComponent={<Button title="Log Out" onPress={() => setToken(null)} />}
        onRefresh={refetch}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 16, backgroundColor: 'white' },
  item: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: { fontSize: 16, fontWeight: '500' },
  uri: { fontSize: 12, color: 'gray', marginTop: 4 },
});
