import React, { useEffect, useRef, memo } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { editorHtml } from './editor-html';
import type { CursorPosition } from './types';

interface Props {
  initialValue: string;
  language: string;
  style?: object;
  onLoad?: () => void;
  onContentChange?: (value: string) => void;
  onCursorChange?: (pos: CursorPosition) => void;
  remoteCursors?: { position: CursorPosition; name: string }[];
}

const MonacoEditor = memo(({ initialValue, language, style, onLoad, onContentChange, onCursorChange, remoteCursors }: Props) => {
    const webviewRef = useRef<WebView>(null);
    const editorRef = useRef<unknown>(null);
    const htmlContent = editorHtml(initialValue, language);

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
        const script = `\n                const decorations = ${JSON.stringify(remoteCursors)}.map(cursor => ({\n                    range: new monaco.Range(cursor.position.lineNumber, cursor.position.column, cursor.position.lineNumber, cursor.position.column),\n                    options: {\n                        className: 'remote-cursor',\n                        stickiness: 1,\n   afterContentClassName: 'remote-cursor-label',\n   after: { content: \`${cursor.name}\` }\n                    }\n  }));\n                editor.deltaDecorations([], decorations);\n            `;
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
