import * as React from 'react';
import { TextInputProps, TextInput } from 'react-native';

export type MonacoEditorRef = TextInput;
export interface MonacoEditorProps extends TextInputProps {}

export const MonacoEditor: React.ForwardRefExoticComponent<MonacoEditorProps & React.RefAttributes<MonacoEditorRef>>;
export default MonacoEditor;
