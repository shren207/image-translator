import type { TranslationResult } from '../types';

interface TranslationHistoryProps {
  history: TranslationResult[];
  onSelect: (item: TranslationResult) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

export function TranslationHistory({
  history,
  onSelect,
  onDelete,
  onClearAll
}: TranslationHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📭</div>
        <p>번역 이력이 없습니다</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">번역 이력 ({history.length})</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-red-500 hover:text-red-700"
        >
          전체 삭제
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <img
              src={`data:image/png;base64,${item.translatedImage}`}
              alt={item.originalFilename}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.originalFilename}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(item.fileSize)} · {formatDate(item.createdAt)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
