import React, { forwardRef, useImperativeHandle, useRef, useMemo, useEffect } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Y from 'yjs';
import { editorHtml } from './editor-html';

export interface MonacoEditorRef {
  revealLineInCenter: (lineNumber: number, scroll?: number) => void;
  getEditor: () => unknown;
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface MonacoEditorProps {
  doc: Y.Text;
  language?: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
  remoteCursors?: { position: CursorPosition; color: string; name: string }[];
  style?: object;
  onLoad?: () => void;
}

const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  ({ doc, language = 'plaintext', onContentChange, onCursorChange, remoteCursors, style, onLoad }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const editorRef = useRef<unknown>(null);

    const initialText = useMemo(() => doc.toString().replace(/`/g, '\\`'), [doc]);
    const htmlContent = useMemo(() => editorHtml(initialText, language), [initialText, language]);

    useImperativeHandle(ref, () => ({
      revealLineInCenter: (lineNumber, scroll = 1) => {
        const command = `editor.revealLineInCenter(${lineNumber}, ${scroll});`;
        webviewRef.current?.injectJavaScript(command);
      },
      getEditor: () => editorRef.current,
    }), []);

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        let message: { type: string; payload: unknown };
        try {
          message = JSON.parse(event.nativeEvent.data);
        } catch (error) {
          console.warn('Failed to parse WebView message:', error);
          return;
        }
        switch (message.type) {
          case 'editorDidMount':
            editorRef.current = message.payload;
            onLoad?.();
            break;
          case 'contentDidChange': {
            const payload = message.payload;
            if (
              payload &&
              typeof payload === 'object' &&
              'value' in payload &&
              typeof (payload as Record<string, unknown>).value === 'string'
            ) {
              onContentChange?.((payload as { value: string }).value);
            } else {
              console.warn('Invalid payload for contentDidChange:', payload);
            }
            break;
          }
          case 'cursorDidChange':
            onCursorChange?.(
              (message.payload as { position: CursorPosition }).position
            );
            break;
          default:
            console.warn(`Unknown message type from WebView: ${message.type}`);
        }
      } catch (e) {
        console.error('Failed to parse message from WebView', e);
      }
    };

    useEffect(() => {
      if (remoteCursors && remoteCursors.length > 0) {
        const script = `\n                const decorations = ${JSON.stringify(remoteCursors)}.map(cursor => ({\n                    range: new monaco.Range(cursor.position.lineNumber, cursor.position.column, cursor.position.lineNumber, cursor.position.column),\n                    options: {\n                        className: 'remote-cursor',\n                        stickiness: 1,\n            afterContentClassName: 'remote-cursor-label',\n   after: { content: \`${cursor.name}\` }\n                    }\n  }));\n                editor.deltaDecorations([], decorations);\n            `;
        webviewRef.current?.injectJavaScript(script);
      }
    }, [remoteCursors]);

    return (
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: '' }}
        style={style}
        onMessage={handleMessage}
        javaScriptEnabled
        allowFileAccess
        onShouldStartLoadWithRequest={event => event.url === 'about:blank'}
      />
    );
  }
);

export default MonacoEditor;
