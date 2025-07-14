import React, { forwardRef, useImperativeHandle, useRef, useMemo, useEffect } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Y from 'yjs';
import { editorHtml } from './editor-html';

export interface MonacoEditorRef {
  revealLineInCenter: (lineNumber: number, scroll?: number) => void;
  getEditor: () => any;
}

export interface MonacoEditorProps {
  doc: Y.Text;
  language?: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (position: any) => void;
  remoteCursors?: { position: any; color: string; name: string }[];
  style?: object;
  onLoad?: () => void;
}

const MonacoEditor = forwardRef<MonacoEditorRef, MonacoEditorProps>(
  ({ doc, language = 'plaintext', onContentChange, onCursorChange, remoteCursors, style, onLoad }, ref) => {
    const webviewRef = useRef<WebView>(null);
    const editorRef = useRef<any>(null);

    const initialText = useMemo(() => doc.toString().replace(/`/g, '\\`'), [doc]);
    const htmlContent = useMemo(
      () =>
        editorHtml(
          initialText,
          language,
          `\n          // Y.js and MonacoBinding setup will be injected here\n          // This creates a placeholder for the collaborative bindings\n        `
        ),
      [initialText, language]
    );

    useImperativeHandle(ref, () => ({
      revealLineInCenter: (lineNumber, scroll = 1) => {
        const command = `editor.revealLineInCenter(${lineNumber}, ${scroll});`;
        webviewRef.current?.injectJavaScript(command);
      },
      getEditor: () => editorRef.current,
    }), []);

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        switch (message.type) {
          case 'editorDidMount':
            editorRef.current = message.payload;
            onLoad?.();
            break;
          case 'contentDidChange':
            onContentChange?.(message.payload.value);
            break;
          case 'cursorDidChange':
            onCursorChange?.(message.payload.position);
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
        const script = `
          (function() {
            if (typeof editor === 'undefined' || typeof monaco === 'undefined') return;
            const cursors = ${JSON.stringify(remoteCursors)};
            const decorations = cursors.map(c => ({
                range: new monaco.Range(
                    Math.max(1, c.position.lineNumber || 1), 
                    Math.max(1, c.position.column || 1), 
                    Math.max(1, c.position.lineNumber || 1), 
                    Math.max(1, c.position.column || 1)
                ),
                options: {
                className: 'remote-cursor',
                stickiness: 1,
                afterContentClassName: 'remote-cursor-label',
                after: { content: c.name }
            }));
                    window.__remoteCursorDecorationIds = editor.deltaDecorations(window.__remoteCursorDecorationIds || [], decorations);
                  })();
                `;
                webviewRef.current?.injectJavaScript(script);
      } else {
        // Remove remote cursor decorations if no remote cursors
        const clearScript = `
          (function() {
            if (window.__remoteCursorDecorationIds && window.__remoteCursorDecorationIds.length > 0) {
              window.__remoteCursorDecorationIds = editor.deltaDecorations(window.__remoteCursorDecorationIds, []);
            }
          })();
        `;
        webviewRef.current?.injectJavaScript(clearScript);
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

