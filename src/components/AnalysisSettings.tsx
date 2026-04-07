'use client';

import { AnalysisMode, Handedness, AnalysisOptions } from '@/types';

interface AnalysisSettingsProps {
  mode: AnalysisMode;
  handedness: Handedness;
  options: AnalysisOptions;
  onModeChange: (mode: AnalysisMode) => void;
  onHandednessChange: (h: Handedness) => void;
  onOptionsChange: (options: AnalysisOptions) => void;
  onFileChange: (file: File) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasVideo: boolean;
}

function getHandLabel(mode: AnalysisMode, side: 'right' | 'left'): string {
  if (mode === 'pitching') return side === 'right' ? '右投' : '左投';
  if (mode === 'batting') return side === 'right' ? '右打' : '左打';
  return side === 'right' ? '右手' : '左手';
}

export default function AnalysisSettings({
  mode,
  handedness,
  options,
  onModeChange,
  onHandednessChange,
  onOptionsChange,
  onFileChange,
  isAnalyzing,
  onAnalyze,
  hasVideo,
}: AnalysisSettingsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg text-gray-800">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>&#9881;</span> 分析設定
      </h2>

      {/* Analysis Mode */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600 mb-2 block">分析模式</label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onModeChange('pitching')}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              mode === 'pitching'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            &#9918; 投球分析
          </button>
          <button
            onClick={() => onModeChange('batting')}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              mode === 'batting'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            &#127951; 打擊分析
          </button>
          <button
            onClick={() => onModeChange('fielding')}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              mode === 'fielding'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            &#129342; 守備分析（滾地球）
          </button>
        </div>
      </div>

      {/* Handedness */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600 mb-2 block">慣用手</label>
        <div className="flex gap-2">
          <button
            onClick={() => onHandednessChange('right')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              handedness === 'right'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {getHandLabel(mode, 'right')}
          </button>
          <button
            onClick={() => onHandednessChange('left')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              handedness === 'left'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {getHandLabel(mode, 'left')}
          </button>
        </div>
      </div>

      {/* Optional Features */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600 mb-2 block">進階功能</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={options.dualPersonality}
              onChange={(e) =>
                onOptionsChange({ ...options, dualPersonality: e.target.checked })
              }
              className="w-4 h-4 rounded accent-purple-600"
            />
            <div>
              <span className="text-sm font-semibold">&#127917; 雙人格教練分析</span>
              <p className="text-xs text-gray-500 mt-0.5">
                鼓勵教練（溫馨版）+ 毒舌球探（殘酷版）
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Upload */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-600 mb-2 block">上傳影片</label>
        <label className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <span className="text-gray-500">&#128206; 點擊選擇影片檔案</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />
        </label>
      </div>

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={!hasVideo || isAnalyzing}
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
          hasVideo && !isAnalyzing
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? '&#9203; 分析中...' : '&#9654; 開始分析'}
      </button>

      {/* Color Legend */}
      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-600 mb-2 block">報告色碼</label>
        <div className="flex gap-3 text-sm flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" /> 需改進
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> 需注意
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 優良
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> 提示
          </span>
        </div>
      </div>
    </div>
  );
}
