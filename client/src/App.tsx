import { useEffect, useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { TranslationHistory } from './components/TranslationHistory';
import { ProgressBar } from './components/ProgressBar';
import { useTranslation } from './hooks/useTranslation';
import { useHistoryStore } from './stores/historyStore';
import type { TranslationResult } from './types';

function App() {
  const [selectedResult, setSelectedResult] = useState<TranslationResult | null>(null);

  const {
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
  } = useTranslation();

  const { history } = useHistoryStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (currentResult && !selectedResult) {
      setSelectedResult(currentResult);
    }
  }, [currentResult, selectedResult]);

  const handleSingleUpload = async (file: File) => {
    setSelectedResult(null);
    await translateImage(file);
  };

  const handleBatchUpload = async (files: File[]) => {
    setSelectedResult(null);
    await translateBatch(files);
  };

  const handleSelectFromHistory = (item: TranslationResult) => {
    setSelectedResult(item);
    setCurrentResult(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Image Translator
          </h1>
          <p className="text-gray-600">
            이미지 내 텍스트를 한국어로 번역합니다
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ImageUploader
                onSingleUpload={handleSingleUpload}
                onBatchUpload={handleBatchUpload}
                disabled={isTranslating}
              />
            </div>

            {/* Progress / Loading */}
            {isTranslating && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {batchProgress ? (
                  <ProgressBar progress={batchProgress} />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">번역 중...</p>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && !isTranslating && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-red-700">오류 발생</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Result Preview */}
            {selectedResult && !isTranslating && (
              <ImagePreview
                result={selectedResult}
                onClose={() => setSelectedResult(null)}
              />
            )}
          </div>

          {/* Right Panel - History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <TranslationHistory
              history={history}
              onSelect={handleSelectFromHistory}
              onDelete={deleteFromHistory}
              onClearAll={clearAllHistory}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
