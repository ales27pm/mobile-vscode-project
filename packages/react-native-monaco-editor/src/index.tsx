import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export type MonacoEditorRef = TextInput;

export interface MonacoEditorProps extends TextInputProps {}

const MonacoEditor = React.forwardRef<MonacoEditorRef, MonacoEditorProps>((props, ref) => {
  return <TextInput ref={ref} multiline {...props} />;
});

export default MonacoEditor;
export { MonacoEditor };
