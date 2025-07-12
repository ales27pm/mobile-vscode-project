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
        console.warn('MonacoEditor focus is not implemented.');
      },
      revealLineInCenter: () => {
        console.warn('MonacoEditor revealLineInCenter is not implemented.');
      },
    }));
    return <View />;
  }
);

export default MonacoEditor;
export { MonacoEditorRef, MonacoEditorProps };
