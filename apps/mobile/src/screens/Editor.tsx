import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import EditorComponent, { MonacoEditorRef } from 'packages/editor';
import { useYDoc } from '../hooks/useYDoc';
import { useMutation } from '@apollo/client';
import { WriteFileDocument } from 'shared/src/types';
import debounce from 'lodash.debounce';
import { useDocumentStore } from '../state/documentStore';

export default function Editor({ route, navigation }) {
  const { path } = route.params;
  const { ydoc, isLoading, awareness } = useYDoc(path);
  const [writeFile] = useMutation(WriteFileDocument);
  interface RemoteCursor {
    position: { line: number; column: number };
    color: string;
    name: string;
  }

  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const editorRef = React.useRef<MonacoEditorRef>(null);
  const consumeEditorAction = useDocumentStore(state => state.consumeEditorAction);

  const saveContent = React.useMemo(
    () =>
      debounce((content: string) => {
        writeFile({ variables: { path, content } });
      }, 1000),
    [writeFile, path]
  );

  useEffect(() => {
    return () => {
      saveContent.cancel();
    };
  }, [saveContent]);

  useEffect(() => {
    navigation.setOptions({ title: path.split('/').pop() });
    const action = consumeEditorAction();
    if (action?.type === 'highlight-line' && editorRef.current) {
      editorRef.current.revealLineInCenter(action.payload.line, 0);
    }
  }, [path, navigation, consumeEditorAction]);

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
