import React, { useEffect, useRef, forwardRef, useImperativeHandle, memo, useMemo } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Y from 'yjs';
import { editorHtml } from './editor-html';
import type { CursorPosition } from './types';

export interface MonacoEditorRef {
  revealLineInCenter: (lineNumber: number, scroll?: number) => void;
  getEditor: () => unknown;
}

interface Props {
  doc: Y.Text;
  language?: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (pos: CursorPosition) => void;
  remoteCursors?: { position: CursorPosition; color: string; name: string }[];
  style?: object;
  onLoad?: () => void;
}

const MonacoEditorInner = (
  { doc, language = 'plaintext', onContentChange, onCursorChange, remoteCursors, style, onLoad }: Props,
  ref: React.Ref<MonacoEditorRef>
) => {
    const webviewRef = useRef<WebView>(null);
    const editorRef = useRef<unknown>(null);
    
    const initialText = useMemo(() => {
        // Use JSON.stringify to robustly escape characters for JS context
        return JSON.stringify(doc.toString()).slice(1, -1);
    }, [doc]);

    const htmlContent = useMemo(() => editorHtml(initialText, language), [initialText, language]);

    useImperativeHandle(ref, () => ({
      revealLineInCenter: (lineNumber: number, scroll = 1) => {
        const command = `editor.revealLineInCenter(${lineNumber}, ${scroll});`;
        webviewRef.current?.injectJavaScript(command);
      },
      getEditor: () => editorRef.current,
    }), []);

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.nativeEvent.data);
        
        switch (type) {
          case 'editorDidMount':
            editorRef.current = payload;
            onLoad?.();
            break;
          case 'contentDidChange': {
            if (
              payload &&
              typeof payload === 'object' &&
              'value' in payload &&
              typeof (payload as any).value === 'string'
            ) {
              onContentChange?.((payload as { value: string }).value);
            }
            break;
          }
          case 'cursorDidChange':
            onCursorChange?.((payload as { position: CursorPosition }).position);
            break;
        }
      } catch (e) {
        console.error('Failed to parse message from WebView', e);
      }
    };

    useEffect(() => {
      if (remoteCursors && remoteCursors.length > 0) {
        const script = `
                const decorations = ${JSON.stringify(remoteCursors)}.map(cursor => ({
                    range: new monaco.Range(cursor.position.lineNumber, cursor.position.column, cursor.position.lineNumber, cursor.position.column),
                    options: {
                        className: 'remote-cursor',
                        stickiness: 1,
                        afterContentClassName: 'remote-cursor-label',
                        after: { content: cursor.name }
                    }
                }));
                editor.deltaDecorations([], decorations);
            `;
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
  };

const MonacoEditor = memo(forwardRef<MonacoEditorRef, Props>(MonacoEditorInner));

export default MonacoEditor;
