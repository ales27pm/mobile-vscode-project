import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

export type MonacoEditorRef = TextInput;

export interface MonacoEditorProps extends TextInputProps {}

/**
 * Placeholder component for future Monaco Editor integration.
 * Currently wraps a React Native TextInput to provide a compatible interface.
 * 
 * TODO: Replace this implementation with Monaco Editor integration when available.
 */
const MonacoEditor = React.forwardRef<MonacoEditorRef, MonacoEditorProps>((props, ref) => {
  return <TextInput ref={ref} multiline {...props} />;
});

export default MonacoEditor;
export { MonacoEditor };
