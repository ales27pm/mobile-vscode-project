import React from 'react';
import { View, Button, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { GitStatusDocument, CommitDocument, PushDocument } from 'shared/src/types';

export default function Git() {
  const { data, loading, refetch } = useQuery(GitStatusDocument);
  const [commit, { loading: cLoading }] = useMutation(CommitDocument, { onCompleted: () => refetch() });
  const [push, { loading: pLoading }] = useMutation(PushDocument, { onCompleted: () => refetch() });

  return (
    <View style={styles.container}>
      <Button title="Refresh" onPress={() => refetch()} disabled={loading} />
      {loading ? <ActivityIndicator/> : (
        <>
            <Text style={styles.branch}>Branch: {data?.gitStatus.branch}</Text>
            <Text style={styles.header}>Changes:</Text>
            <FlatList
                data={data?.gitStatus.changes}
                keyExtractor={item => item}
                renderItem={({ item }) => <Text style={styles.change}>{item}</Text>}
                ListEmptyComponent={<Text style={styles.change}>No changes detected.</Text>}
            />
            <View style={styles.actions}>
                <Button title="Commit All" onPress={() => commit({ variables: { message: 'Commit from mobile' } })} disabled={cLoading || pLoading} />
                <Button title="Push" onPress={() => push()} disabled={cLoading || pLoading}/>
            </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 8 },
    branch: { fontWeight: 'bold', fontSize: 16 },
    header: { fontWeight: 'bold' },
    change: { fontFamily: 'monospace', paddingVertical: 2 },
    actions: { marginTop: 'auto', gap: 8 }
});
