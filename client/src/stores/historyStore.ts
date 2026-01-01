import { create } from 'zustand';
import type { TranslationResult } from '../types';

interface HistoryState {
  history: TranslationResult[];
  isLoading: boolean;
  error: string | null;
  setHistory: (history: TranslationResult[]) => void;
  addToHistory: (item: TranslationResult) => void;
  removeFromHistory: (id: number) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,
  setHistory: (history) => set({ history }),
  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history]
  })),
  removeFromHistory: (id) => set((state) => ({
    history: state.history.filter((item) => item.id !== id)
  })),
  clearHistory: () => set({ history: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
