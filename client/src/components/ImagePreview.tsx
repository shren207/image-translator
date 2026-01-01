import { useState } from 'react';
import type { TranslationResult } from '../types';

interface ImagePreviewProps {
  result: TranslationResult;
  onClose?: () => void;
}

export function ImagePreview({ result, onClose }: ImagePreviewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${result.translatedImage}`;
    link.download = `translated_${result.originalFilename}`;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">{result.originalFilename}</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      <div className="relative">
        <img
          src={`data:image/png;base64,${showOriginal ? result.originalImage : result.translatedImage}`}
          alt={showOriginal ? 'Original' : 'Translated'}
          className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
        />

        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {showOriginal ? '원본' : '번역됨'}
        </div>
      </div>

      <div className="p-4 flex gap-2">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          {showOriginal ? '번역본 보기' : '원본 보기'}
        </button>
        <button
          onClick={downloadImage}
          className="flex-1 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition"
        >
          다운로드
        </button>
      </div>
    </div>
  );
}
