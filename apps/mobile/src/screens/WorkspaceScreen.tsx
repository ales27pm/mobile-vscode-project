import React from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@apollo/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListWorkspacesDocument, ListWorkspacesQuery } from 'shared/types';
import { client } from '../apolloClient';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../state/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkspaceList'>;

export default function WorkspaceScreen({ navigation }: Props) {
  const { data, loading, error, refetch } = useQuery<ListWorkspacesQuery>(ListWorkspacesDocument, {
    fetchPolicy: 'network-only',
  });
  const setToken = useAuthStore(state => state.setToken);

  const handleLogout = async () => {
    try {
      await setToken(null);
      await client.clearStore();
    } catch (logoutError) {
      console.warn('Unable to clear the MobileVSCode session.', logoutError);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text selectable>Error loading workspaces: {error.message}</Text>
        <Button title="Retry" onPress={() => void refetch()} />
        <Button title="Pair Again" onPress={() => void handleLogout()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={data?.listWorkspaces ?? []}
        keyExtractor={item => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('MainApp', {
              workspaceUri: item.uri,
              workspaceName: item.name,
            })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text selectable style={styles.uri} numberOfLines={1}>{item.uri}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={<Text style={styles.title}>Select a Workspace</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No open VS Code workspaces were found.</Text>}
        ListFooterComponent={<Button title="Log Out" onPress={() => void handleLogout()} />}
        onRefresh={() => void refetch()}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  content: { flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', padding: 16, backgroundColor: 'white' },
  empty: { padding: 24, textAlign: 'center', color: 'gray' },
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
