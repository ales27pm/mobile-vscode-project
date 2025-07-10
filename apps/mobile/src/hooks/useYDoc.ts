import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { YWS_URL } from '../config';
import { useQuery } from '@apollo/client';
import { ReadFileDocument } from 'shared/src/types';

const colors = ['#30bced', '#6eeb83', '#ffbc42', '#ecd444', '#ee6352', '#9ac2c9', '#8acb88', '#1be7ff'];
const myColor = colors[Math.floor(Math.random() * colors.length)];
const myName = `User ${Math.floor(Math.random() * 100)}`;

export function useYDoc(docId: string) {
  const ydoc = useRef(new Y.Doc()).current;
  const providerRef = useRef<WebsocketProvider | null>(null);

  const { loading } = useQuery(ReadFileDocument, {
    variables: { path: docId },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.readFile && ydoc.getText('monaco').length === 0) {
        ydoc.getText('monaco').insert(0, data.readFile);
      }
    }
  });

  useEffect(() => {
    const provider = new WebsocketProvider(YWS_URL, docId, ydoc);
    provider.awareness.setLocalStateField('user', {
        name: myName,
        color: myColor,
    });
    providerRef.current = provider;
    
    return () => {
      provider.disconnect();
    };
  }, [docId, ydoc]);

  return { ydoc, isLoading: loading, awareness: providerRef.current?.awareness };
}
