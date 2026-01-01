import { useState, useCallback } from 'react';
import type { TranslationResult, BatchProgress } from '../types';
import { useHistoryStore } from '../stores/historyStore';

const API_BASE = '/api';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<TranslationResult | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  const { addToHistory, setHistory, removeFromHistory, clearHistory } = useHistoryStore();

  const translateImage = useCallback(async (
    file: File
  ): Promise<TranslationResult | null> => {
    setIsTranslating(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          filename: file.name,
          mimeType: file.type || 'image/png'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Translation failed');
      }

      const result = data.data as TranslationResult;
      setCurrentResult(result);
      addToHistory(result);
      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [addToHistory]);

  const translateBatch = useCallback(async (
    files: File[]
  ): Promise<TranslationResult[]> => {
    setIsTranslating(true);
    setError(null);
    setBatchProgress({
      total: files.length,
      completed: 0,
      current: '',
      results: [],
      errors: []
    });

    const results: TranslationResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchProgress(prev => prev ? {
        ...prev,
        current: file.name,
        completed: i
      } : null);

      try {
        const base64 = await fileToBase64(file);

        const response = await fetch(`${API_BASE}/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
            mimeType: file.type || 'image/png'
          })
        });

        const data = await response.json();

        if (data.success && data.data) {
          results.push(data.data);
          addToHistory(data.data);
        } else {
          errors.push(`${file.name}: ${data.error}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${file.name}: ${message}`);
      }

      setBatchProgress(prev => prev ? {
        ...prev,
        completed: i + 1,
        results: [...results],
        errors: [...errors]
      } : null);
    }

    setIsTranslating(false);

    if (errors.length > 0) {
      setError(`${errors.length} files failed to translate`);
    }

    return results;
  }, [addToHistory]);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/history`);
      const data = await response.json();

      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [setHistory]);

  const deleteFromHistory = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        removeFromHistory(id);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }, [removeFromHistory]);

  const clearAllHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/history`, {
        method: 'DELETE'
      });

      if (response.ok) {
        clearHistory();
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, [clearHistory]);

  return {
    isTranslating,
    error,
    currentResult,
    batchProgress,
    translateImage,
    translateBatch,
    fetchHistory,
    deleteFromHistory,
    clearAllHistory,
    setCurrentResult,
    setError
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
