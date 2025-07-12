import { create } from 'zustand';

export interface EditorAction {
  type: 'highlight-line';
  payload: { line: number };
}

interface DocumentState {
  editorAction: EditorAction | null;
  setEditorAction: (action: EditorAction | null) => void;
  consumeEditorAction: () => EditorAction | null;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  editorAction: null,
  setEditorAction: action => set({ editorAction: action }),
  consumeEditorAction: () => {
    const action = get().editorAction;
    if (action) {
      set({ editorAction: null });
    }
    return action;
  },
}));
