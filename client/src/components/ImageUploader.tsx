import { useCallback, useState, DragEvent } from 'react';

interface ImageUploaderProps {
  onSingleUpload: (file: File) => void;
  onBatchUpload: (files: File[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ onSingleUpload, onBatchUpload, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    if (imageFiles.length === 1 && pendingFiles.length === 0) {
      // 단일 파일: 바로 번역 시작
      onSingleUpload(imageFiles[0]);
    } else {
      // 여러 파일: 대기 목록에 추가
      setPendingFiles(prev => [...prev, ...imageFiles]);
    }
  }, [onSingleUpload, pendingFiles.length]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartBatch = useCallback(() => {
    if (pendingFiles.length === 1) {
      onSingleUpload(pendingFiles[0]);
    } else if (pendingFiles.length > 1) {
      onBatchUpload(pendingFiles);
    }
    setPendingFiles([]);
  }, [pendingFiles, onSingleUpload, onBatchUpload]);

  const clearAll = useCallback(() => {
    setPendingFiles([]);
  }, []);

  return (
    <div className="space-y-4">
      {/* 드롭 영역 */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all min-h-[180px] flex items-center justify-center
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-4xl mb-4">
            {isDragging ? '📥' : '🖼️'}
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? '여기에 놓으세요!' : '이미지를 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP 등 지원 · 여러 파일 선택 가능
          </p>
        </label>
      </div>

      {/* 대기 중인 파일 목록 */}
      {pendingFiles.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">
              선택된 파일 ({pendingFiles.length}개)
            </span>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-700"
            >
              전체 삭제
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex justify-between items-center text-sm bg-white p-3 rounded-lg"
              >
                <span className="truncate flex-1 text-gray-700">{file.name}</span>
                <span className="text-gray-400 text-xs mx-2">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartBatch}
            disabled={disabled}
            className="mt-4 w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {pendingFiles.length === 1 ? '번역 시작' : `${pendingFiles.length}개 이미지 번역 시작`}
          </button>
        </div>
      )}
    </div>
  );
}
