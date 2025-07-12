import React, { useRef, useState, useEffect } from 'react';
import MonacoEditor, { MonacoEditorRef } from 'react-native-monaco-editor';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

export interface CursorData {
  position: monaco.Position;
  color: string;
  name: string;
}

export interface EditorProps {
  doc: Y.Text;
  language: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (pos: monaco.Position) => void;
  remoteCursors?: CursorData[];
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  style?: any;
}

export const MonacoEditorComponent = React.forwardRef<MonacoEditorRef, EditorProps>(function MonacoEditorComponent(
  { doc, language, onContentChange, onCursorChange, remoteCursors = [], options = {}, style },
  ref
) {
  const editorRef = useRef<MonacoEditorRef>(null);
  const decorationIds = useRef<string[]>([]);

  // Expose ref
  React.useImperativeHandle(ref, () => editorRef.current as MonacoEditorRef, []);

  // Bind Yjs document to Monaco when loaded
  const handleLoad = () => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    new MonacoBinding(doc, model, new Set([editor]));

    editor.onDidChangeModelContent(() => {
      onContentChange?.(model.getValue());
    });
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position);
    });
  };

  // Update remote cursor decorations
  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    const decorations = remoteCursors.map((c) => ({
      range: new monaco.Range(c.position.lineNumber, c.position.column, c.position.lineNumber, c.position.column),
      options: {
        className: 'remote-cursor',
        afterContentClassName: 'remote-cursor-label',
        overviewRuler: {
          color: c.color,
          position: monaco.editor.OverviewRulerLane.Full,
        },
      },
    }));
    decorationIds.current = editor.deltaDecorations(decorationIds.current, decorations);
  }, [remoteCursors]);

  return (
    <MonacoEditor
      ref={editorRef}
      language={language}
      options={{ theme: 'vs-dark', automaticLayout: true, minimap: { enabled: false }, ...options }}
      style={style}
      onLoad={handleLoad}
    />
  );
});

export type MonacoEditorRefInstance = MonacoEditorRef;
export default MonacoEditorComponent;
