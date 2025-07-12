import React from 'react';
import { TextInput } from 'react-native';

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
  function MonacoEditor({ value, onChangeText, style }, ref) {
    const inputRef = React.useRef<TextInput>(null);

    const focus = () => {
      inputRef.current?.focus();
    };

    const revealLineInCenter = (_lineNumber: number) => {
      // Not implemented, but keeps API surface compatible
    };

    React.useImperativeHandle(ref, () => ({ focus, revealLineInCenter }));

    return (
      <TextInput
        ref={inputRef}
        multiline
        value={value}
        onChangeText={onChangeText}
        style={style}
      />
    );
  }
);

export default MonacoEditor;
export { MonacoEditorRef, MonacoEditorProps };
