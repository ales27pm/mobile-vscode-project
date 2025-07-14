import { useDocumentStore } from '../state/documentStore';

describe('documentStore', () => {
  test('consumeEditorAction clears action', () => {
    useDocumentStore.getState().setEditorAction({ type: 'highlight-line', payload: { line: 5 } });
    const first = useDocumentStore.getState().consumeEditorAction();
    expect(first).toEqual({ type: 'highlight-line', payload: { line: 5 } });
    const second = useDocumentStore.getState().consumeEditorAction();
    expect(second).toBeNull();
  });
});
