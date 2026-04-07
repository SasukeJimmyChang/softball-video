'use client';

import { AnalysisResultItem, StatusColor } from '@/types';

interface AnalysisReportProps {
  results: AnalysisResultItem[] | null;
  isAnalyzing: boolean;
  summary: string | null;
}

const statusConfig: Record<StatusColor, { bg: string; border: string; label: string }> = {
  red: { bg: 'bg-red-50', border: 'border-red-400', label: '需改進' },
  orange: { bg: 'bg-amber-50', border: 'border-amber-400', label: '需注意' },
  green: { bg: 'bg-green-50', border: 'border-green-400', label: '優良' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-400', label: '提示' },
};

const statusBadgeColor: Record<StatusColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-amber-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

export default function AnalysisReport({ results, isAnalyzing, summary }: AnalysisReportProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden text-gray-800">
      <div className="bg-gray-800 px-4 py-2 text-white font-bold flex items-center gap-2">
        <span>&#128202;</span> AI 動作分析報告
      </div>
      <div className="p-4">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-4 animate-spin">&#9881;</div>
            <p className="text-lg font-semibold">AI 分析中...</p>
            <p className="text-sm">正在將影格送入 Gemini API 進行姿勢分析</p>
          </div>
        ) : results ? (
          <>
            {summary && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <strong>&#128161; 總評：</strong> {summary}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <div
                    key={item.id}
                    className={`${config.bg} border-l-4 ${config.border} rounded-lg p-3`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`${statusBadgeColor[item.status]} text-white text-xs font-bold px-2 py-0.5 rounded`}
                      >
                        {item.id}
                      </span>
                      <span className="font-bold text-sm">{item.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.comment}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-4xl mb-4">&#129302;</div>
            <p className="text-lg font-semibold">等待分析開始</p>
            <p className="text-sm">請上傳影片並點擊開始分析</p>
            <p className="text-sm">AI 將自動每 0.1 秒分析一幀</p>
            <p className="text-sm">產生完整動作診斷報告</p>
          </div>
        )}
      </div>
    </div>
  );
}
