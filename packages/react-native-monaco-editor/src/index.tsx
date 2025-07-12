import React from 'react';
import { View } from 'react-native';

export type MonacoEditorRef = {
  focus: () => void;
  revealLineInCenter: (lineNumber: number) => void;
};

export interface MonacoEditorProps {
  value?: string;
  language?: string;
  onChangeText?: (value: string) => void;
  style?: object;
}

const MonacoEditor = React.forwardRef<MonacoEditorRef, MonacoEditorProps>(
  function MonacoEditor(_props, ref) {
    React.useImperativeHandle(ref, () => ({
      focus: () => {
        /* Stub implementation for native focus */
        console.debug('MonacoEditor.focus called');
      },
      revealLineInCenter: (lineNumber: number) => {
        /* Stub implementation for scrolling */
        console.debug('MonacoEditor.revealLineInCenter called', lineNumber);
      },
    }));
    return <View />;
  }
);

export default MonacoEditor;
export { MonacoEditorRef, MonacoEditorProps };
