export const editorHtml = (initialValue: string, language: string, yjsScript: string) => `
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
            if (window.ReactNativeWebView) {
                try {
                    const safePayload = JSON.parse(JSON.stringify(payload, (key, value) => {
                        if (typeof value === 'function') return '[Function]';
                        if (typeof value === 'undefined') return null;
                        return value;
                    }));
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload: safePayload }));
                } catch (error) {
                    console.error('Failed to serialize message:', error);
                    // Send fallback message with error info
                    try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ 
                            type: 'error', 
                            payload: { message: 'Serialization failed', originalType: String(type) } 
                        }));
                    } catch (fallbackError) {
                        console.error('Failed to send fallback error message:', fallbackError);
                        console.error('WebView communication completely failed');
                        // Attempt to reinitialize communication or show user-friendly error
                        setTimeout(() => {
                            if (window.ReactNativeWebView) {
                                console.log('WebView communication restored, retrying...');
                                // Retry the original message
                                postMessage(type, payload);
                            } else {
                                console.error('WebView communication permanently failed');
                            }
                        }, 1000);
                        return;
                    }
                }
            } else {
                console.warn('ReactNativeWebView not available, message not sent:', { type, payload });
            }
        };
window.MonacoEnvironment = { getWorkerUrl: function() {
    const workerCode = `
        self.MonacoEnvironment = { baseUrl: 'https://unpkg.com/monaco-editor@0.33.0/min/' };
        importScripts('https://unpkg.com/monaco-editor@0.33.0/min/vs/base/worker/workerMain.js');
    `;
    return URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' }));
} };
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
        ${yjsScript}
    </script>
</body>
</html>
`;

