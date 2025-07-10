import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import EditorComponent, { MonacoEditorRef } from 'packages/editor';
import { useYDoc } from '../hooks/useYDoc';
import { useMutation } from '@apollo/client';
import { WriteFileDocument } from 'shared/src/types';
import debounce from 'lodash.debounce';

export default function Editor({ route, navigation }) {
  const { path, highlight } = route.params;
  const { ydoc, isLoading, awareness } = useYDoc(path);
  const [writeFile] = useMutation(WriteFileDocument);
  const [remoteCursors, setRemoteCursors] = useState([]);
  const editorRef = React.useRef<MonacoEditorRef>(null);

  const saveContent = debounce((content: string) => {
    writeFile({ variables: { path, content } });
  }, 1000);

  useEffect(() => {
    navigation.setOptions({ title: path.split('/').pop() });
    if (highlight && editorRef.current) {
        editorRef.current.revealLineInCenter(highlight, 0);
    }
  }, [path, highlight, navigation]);

  useEffect(() => {
    if (!awareness) return;
    const updateCursors = () => {
        const states = Array.from(awareness.getStates().values());
        const cursors = states
            .filter(state => state.cursor && state.user && awareness.getLocalState()?.user.name !== state.user.name)
            .map(state => ({
                position: state.cursor,
                color: state.user.color,
                name: state.user.name,
            }));
        setRemoteCursors(cursors);
    };
    awareness.on('change', updateCursors);
    return () => awareness.off('change', updateCursors);
  }, [awareness]);

  if (isLoading || !ydoc) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <EditorComponent
        ref={editorRef}
        doc={ydoc.getText('monaco')}
        language={(path.split('.').pop())}
        onContentChange={saveContent}
        onCursorChange={(position) => awareness?.setLocalStateField('cursor', position)}
        remoteCursors={remoteCursors}
      />
    </View>
  );
}
