import React from 'react';
import { View, FlatList, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { ExtensionsDocument, InstallExtensionDocument, UninstallExtensionDocument } from 'shared/src/types';

export default function Extensions() {
  const { data, loading, refetch } = useQuery(ExtensionsDocument);
  const [install, { loading: iLoading }] = useMutation(InstallExtensionDocument, { onCompleted: refetch });
  const [uninstall, { loading: uLoading }] = useMutation(UninstallExtensionDocument, { onCompleted: refetch });

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.extensions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{item.description}</Text>
            </View>
            <Button
              title={item.installed ? "Uninstall" : "Install"}
              onPress={() => item.installed ? uninstall({ variables: { id: item.id } }) : install({ variables: { id: item.id } })}
              disabled={iLoading || uLoading}
            />
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#eee'},
    info: { flex: 1, marginRight: 8 },
    name: { fontWeight: 'bold' }
});
