import type { BatchProgress } from '../types';

interface ProgressBarProps {
  progress: BatchProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">일괄 번역 진행 중</span>
        <span className="text-sm text-gray-500">
          {progress.completed} / {progress.total}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {progress.current && (
        <p className="text-sm text-gray-600 truncate">
          처리 중: {progress.current}
        </p>
      )}

      {progress.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm font-medium text-red-700 mb-1">
            실패: {progress.errors.length}건
          </p>
          <ul className="text-xs text-red-600 space-y-1">
            {progress.errors.slice(0, 3).map((err, i) => (
              <li key={i} className="truncate">{err}</li>
            ))}
            {progress.errors.length > 3 && (
              <li>... 외 {progress.errors.length - 3}건</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
