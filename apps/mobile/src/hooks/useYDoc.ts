import { useEffect, useRef } from 'react';
import { Buffer } from 'buffer';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { YWS_URL } from '../config';
import { useQuery } from '@apollo/client';
import { ReadFileDocument } from 'shared/src/types';

const colors = ['#30bced', '#6eeb83', '#ffbc42', '#ecd444', '#ee6352', '#9ac2c9', '#8acb88', '#1be7ff'];
const myColor = colors[Math.floor(Math.random() * colors.length)];
const myName = `User ${Math.floor(Math.random() * 100)}`;

export function useYDoc(workspaceUri: string, docId: string) {
  const ydoc = useRef(new Y.Doc()).current;
  const providerRef = useRef<WebsocketProvider | null>(null);
  const encode = useCallback((value: string) =>
    typeof globalThis.btoa === 'function'
      ? globalThis.btoa(value)
      : Buffer.from(value, 'utf-8').toString('base64'), []);
  const roomName = useMemo(() => {
    const encoded = encode(`${workspaceUri}|${docId}`);
    const replacements: Record<string, string> = { '+': '-', '/': '_', '=': '' };
    return encoded.replace(/[+/=]/g, (m) => replacements[m]);
    }, [workspaceUri, docId, encode]);

  const { loading } = useQuery(ReadFileDocument, {
    variables: { workspaceUri, path: docId },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.readFile && ydoc.getText('monaco').length === 0) {
        ydoc.getText('monaco').insert(0, data.readFile);
      }
    }
  });

  useEffect(() => {
    // Ensure we don't create providers until we have the necessary info
    if (!workspaceUri || !docId) return;

    const provider = new WebsocketProvider(YWS_URL, roomName, ydoc);
    provider.awareness.setLocalStateField('user', {
        name: myName,
        color: myColor,
    });
    providerRef.current = provider;

    return () => {
      providerRef.current?.destroy();
      providerRef.current = null;
    };
  }, [roomName, ydoc]);

  return { ydoc, isLoading: loading, awareness: providerRef.current?.awareness };
}
