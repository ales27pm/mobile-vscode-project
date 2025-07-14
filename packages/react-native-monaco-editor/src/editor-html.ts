/**
 * Generate the HTML string used by the embedded editor.
 * The optional `trustedScript` is inserted verbatim and must not contain
 * untrusted user content.
 */
export const editorHtml = (
  initialValue: string,
  language: string,
  trustedScript = ''
) => {
  if (trustedScript && (/<\s*\/?script\b[^>]*>/i.test(trustedScript) || /javascript:/i.test(trustedScript))) {
    throw new Error('trustedScript must not contain script tags or javascript: URLs')
  }
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title>Monaco Editor</title>
    <style>
        html, body, #container {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        .remote-cursor {
            position: absolute;
            background-color: rgba(255, 0, 0, 0.5);
            width: 2px !important;
        }
        .remote-cursor-label {
            position: absolute;
            background-color: rgba(255, 0, 0, 0.5);
            color: white;
            padding: 2px 4px;
            border-radius: 2px;
            white-space: nowrap;
            font-size: 12px;
            line-height: 1;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <script src="https://unpkg.com/monaco-editor@0.33.0/min/vs/loader.js"></script>
    <script>
        const postMessage = (type, payload) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
        };

        require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.33.0/min/vs' } });
        window.MonacoEnvironment = { getWorkerUrl: function() {
            return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(`
                self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@0.33.0/min/' };
                importScripts('https://unpkg.com/monaco-editor@0.33.0/min/vs/base/worker/workerMain.js');
            `);
        } };

        require(['vs/editor/editor.main'], function () {
            const editor = monaco.editor.create(document.getElementById('container'), {
                value: ${JSON.stringify(initialValue)},
                language: '${language}',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 14,
            });

            postMessage('editorDidMount', {});

            editor.getModel().onDidChangeContent(() => {
                postMessage('contentDidChange', { value: editor.getValue() });
            });

            editor.onDidChangeCursorPosition(e => {
                postMessage('cursorDidChange', { position: e.position });
            });

            window.editor = editor;
            window.monaco = monaco;
        });
        ${trustedScript}
    </script>
</body>
</html>
`
}

