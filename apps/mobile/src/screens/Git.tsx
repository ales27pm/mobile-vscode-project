import React, { useState } from 'react';
import { View, Button, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { GitStatusDocument, GitDiffDocument, GitStageDocument, GitUnstageDocument, CommitDocument, PushDocument } from 'shared/src/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Git({ route }) {
  const { workspaceUri } = route.params;
  const { data, loading, refetch } = useQuery(GitStatusDocument, { variables: { workspaceUri }, fetchPolicy: 'cache-and-network' });

  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitModalVisible, setCommitModalVisible] = useState(false);
  const [diff, setDiff] = useState('');
  const [isDiffModalVisible, setDiffModalVisible] = useState(false);

  const [stage, { loading: stageLoading }] = useMutation(GitStageDocument, { onCompleted: () => refetch() });
  const [unstage, { loading: unstageLoading }] = useMutation(GitUnstageDocument, { onCompleted: () => refetch() });
  const [commit, { loading: cLoading }] = useMutation(CommitDocument, { 
    onCompleted: () => { 
      refetch(); 
      setCommitModalVisible(false); 
      setCommitMessage(''); // Clear commit message after successful commit
    } 
  });
  const [push, { loading: pLoading }] = useMutation(PushDocument);
  const [getDiff] = useMutation(GitDiffDocument);

  const handleViewDiff = async (file: string) => {
    const res = await getDiff({ variables: { workspaceUri, file } });
    setDiff(res.data?.gitDiff ?? 'Could not load diff.');
    setDiffModalVisible(true);
  };

  const renderChange = ({ item, section }) => {
    const isStaged = section.title === 'Staged';
    return (
      <TouchableOpacity style={styles.changeItem} onLongPress={() => handleViewDiff(item)}>
        <Icon name="file-document-outline" size={20} color="#555" />
        <Text
          style={styles.path}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {item}
        </Text>
        <Button
          title={isStaged ? 'Unstage' : 'Stage'}
          onPress={() => isStaged ? unstage({ variables: { workspaceUri, file: item } }) : stage({ variables: { workspaceUri, file: item } }) }
          disabled={stageLoading || unstageLoading}
        />
      </TouchableOpacity>
    );
  };

  if (loading && !data) return <ActivityIndicator style={styles.center} size="large" />;

  const sections = [
    { title: 'Staged', data: data?.gitStatus.staged ?? [] },
    { title: 'Unstaged', data: data?.gitStatus.unstaged ?? [] }
  ];

  return (
    <View style={styles.container}>
      <Modal visible={isDiffModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontFamily: 'monospace' }}>{diff}</Text>
          <Button title="Close" onPress={() => setDiffModalVisible(false)} />
        </View>
      </Modal>

      <Modal visible={isCommitModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TextInput placeholder="Commit message" onChangeText={setCommitMessage} multiline style={styles.commitInput} />
            <Button title="Commit" onPress={() => commit({ variables: { workspaceUri, message: commitMessage } })} disabled={cLoading} />
            <Button title="Cancel" onPress={() => setCommitModalVisible(false)} color="gray" />
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text>Branch: {data?.gitStatus.branch}</Text>
        <Button title="Push" onPress={() => push({ variables: { workspaceUri } })} disabled={pLoading} />
      </View>
      <SectionList
        sections={sections}
        renderItem={renderChange}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title} ({section.data.length})</Text>}
        keyExtractor={(item, index) => item + index}
        onRefresh={refetch}
        refreshing={loading}
      />
      <Button title="Commit Staged" onPress={() => setCommitModalVisible(true)} disabled={!data?.gitStatus.staged.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeader: { fontWeight: 'bold', marginTop: 8 },
  changeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  path: { flex: 1, fontFamily: 'monospace' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', padding: 16, width: '80%', gap: 8, borderRadius: 4 },
  commitInput: { borderWidth: 1, borderColor: '#ccc', marginBottom: 8, padding: 8, minHeight: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
