import React, { useState, useCallback } from 'react';
import { View, Button, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useErrorAlert } from '../hooks/useErrorAlert';
import { GitStatusDocument, GitDiffDocument, GitStageDocument, GitUnstageDocument, CommitDocument, PushDocument } from 'shared/src/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChangeItem = React.memo(function ChangeItem({ file, staged, onStage, onUnstage, onViewDiff, loading }: {
  file: string;
  staged: boolean;
  onStage(): void;
  onUnstage(): void;
  onViewDiff(): void;
  loading: boolean;
}) {
  return (
    <TouchableOpacity style={styles.changeItem} onLongPress={onViewDiff}>
      <Icon name="file-document-outline" size={20} color="#555" style={{ marginRight: 8 }} />
      <Text style={[styles.path, { marginRight: 8 }]} numberOfLines={1} ellipsizeMode="middle">
        {file}
      </Text>
      <Button
        title={staged ? 'Unstage' : 'Stage'}
        onPress={staged ? onUnstage : onStage}
        disabled={loading}
      />
    </TouchableOpacity>
  );
});

function DiffModal({ visible, diff, onClose }: { visible: boolean; diff: string; onClose(): void }) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'monospace' }}>{diff}</Text>
        </ScrollView>
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
}

function CommitModal({ visible, message, onMessage, onCommit, onCancel, loading }: {
  visible: boolean;
  message: string;
  onMessage(text: string): void;
  onCommit(): void;
  onCancel(): void;
  loading: boolean;
}) {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Commit message"
            onChangeText={onMessage}
            value={message}
            multiline
            style={styles.commitInput}
          />
          <View style={{ marginBottom: 8 }}>
            <Button title="Commit" onPress={onCommit} disabled={loading} />
          </View>
          <Button title="Cancel" onPress={onCancel} color="gray" />
        </View>
      </View>
    </Modal>
  );
}

export default function Git({ route }) {
  const { workspaceUri } = route.params;
  const { data, loading, refetch } = useQuery(GitStatusDocument, { variables: { workspaceUri }, fetchPolicy: 'cache-and-network' });

  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitModalVisible, setCommitModalVisible] = useState(false);
  const [diff, setDiff] = useState('');
  const [isDiffModalVisible, setDiffModalVisible] = useState(false);

  const stageError = useErrorAlert('Failed to stage file');
  const unstageError = useErrorAlert('Failed to unstage file');
  const commitError = useErrorAlert('Commit failed');
  const pushError = useErrorAlert('Push failed');
  const diffError = useErrorAlert('Failed to load diff');

  const [stage, { loading: stageLoading }] = useMutation(GitStageDocument, {
    onCompleted: () => refetch(),
    onError: stageError,
  });
  const [unstage, { loading: unstageLoading }] = useMutation(GitUnstageDocument, {
    onCompleted: () => refetch(),
    onError: unstageError,
  });
  const [commit, { loading: cLoading }] = useMutation(CommitDocument, {
    onCompleted: () => {
      setCommitModalVisible(false);
      setCommitMessage('');
      refetch();
    },
    onError: commitError,
  });
  const [push, { loading: pLoading }] = useMutation(PushDocument, {
    onError: pushError,
  });
  const [getDiff] = useLazyQuery(GitDiffDocument, {
    onError: diffError,
  });
  const handleViewDiff = useCallback(async (file: string) => {
    const res = await getDiff({ variables: { workspaceUri, file } });
    if (res.data?.gitDiff) {
      setDiff(res.data.gitDiff);
    } else {
      setDiff('Could not load diff.');
    }
    setDiffModalVisible(true);
  }, [getDiff, workspaceUri]);

  const handleStage = useCallback((file: string) => {
    stage({ variables: { workspaceUri, file } });
  }, [stage, workspaceUri]);

  const handleUnstage = useCallback((file: string) => {
    unstage({ variables: { workspaceUri, file } });
  }, [unstage, workspaceUri]);

const renderChange = useCallback(({ item, section }: { item: { key: string; file: string }; section: { title: string } }) => {
    const isStaged = section.title === 'Staged';
    return (
      <ChangeItem
        file={item.file}
        staged={isStaged}
        onStage={() => handleStage(item.file)}
        onUnstage={() => handleUnstage(item.file)}
        onViewDiff={() => handleViewDiff(item.file)}
        loading={stageLoading || unstageLoading}
      />
    );
  }, [handleStage, handleUnstage, handleViewDiff, stageLoading, unstageLoading]);

  if (loading && !data) return <ActivityIndicator style={styles.center} size="large" />;

  const sections = [
    {
      title: 'Staged',
      data: (data?.gitStatus.staged ?? []).map(f => ({ key: `staged-${f}`, file: f })),
    },
    {
      title: 'Unstaged',
      data: (data?.gitStatus.unstaged ?? []).map(f => ({ key: `unstaged-${f}`, file: f })),
    },
  ];

  return (
    <View style={styles.container}>
      <DiffModal
        visible={isDiffModalVisible}
        diff={diff}
        onClose={() => setDiffModalVisible(false)}
      />

      <CommitModal
        visible={isCommitModalVisible}
        message={commitMessage}
        onMessage={setCommitMessage}
        onCommit={() => commit({ variables: { workspaceUri, message: commitMessage } })}
        onCancel={() => setCommitModalVisible(false)}
        loading={cLoading}
      />

      <View style={styles.header}>
        <Text>Branch: {data?.gitStatus.branch}</Text>
        <Button title="Push" onPress={() => push({ variables: { workspaceUri } })} disabled={pLoading} />
      </View>
      <SectionList
        sections={sections}
        renderItem={renderChange}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title} ({section.data.length})</Text>}
        keyExtractor={(item) => item.key}
        onRefresh={refetch}
        refreshing={loading}
      />
      <Button
        title="Commit Staged"
        onPress={() => setCommitModalVisible(true)}
        disabled={!data?.gitStatus.staged.length || cLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionHeader: { fontWeight: 'bold', marginTop: 8 },
  changeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginBottom: 8 },
  path: { flex: 1, fontFamily: 'monospace' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', padding: 16, width: '80%', borderRadius: 4 },
  commitInput: { borderWidth: 1, borderColor: '#ccc', marginBottom: 8, padding: 8, minHeight: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
