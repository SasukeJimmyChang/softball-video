'use client';

import { useState, useRef, useCallback } from 'react';
import { AnalysisMode, Handedness, AnalysisResultItem, AnalysisOptions, Landmark, DualPersonalityReport } from '@/types';
import AnalysisSettings from '@/components/AnalysisSettings';
import VideoPlayer, { VideoPlayerHandle } from '@/components/VideoPlayer';
import AnalysisReport from '@/components/AnalysisReport';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [mode, setMode] = useState<AnalysisMode>('pitching');
  const [handedness, setHandedness] = useState<Handedness>('right');
  const [options, setOptions] = useState<AnalysisOptions>({ dualPersonality: false });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResultItem[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [dualPersonality, setDualPersonality] = useState<DualPersonalityReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('AI 已就緒！請選擇模式並上傳影片。');
  const [statusType, setStatusType] = useState<'ready' | 'processing' | 'error'>('ready');

  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const handleFileChange = useCallback((file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setResults(null);
    setSummary(null);
    setDualPersonality(null);
    setLandmarks(null);
    setStatusMessage('影片已載入！點擊「開始分析」進行 AI 分析。');
    setStatusType('ready');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    try {
      setIsProcessing(true);
      setIsAnalyzing(false);
      setResults(null);
      setSummary(null);
      setDualPersonality(null);
      setStatusMessage('正在讀取影片檔案...');
      setStatusType('processing');

      // Read video file as base64 — send directly to Gemini (no frame extraction needed)
      const videoBase64 = await readFileAsBase64(videoFile);

      // Check file size (Gemini inline limit ~20MB)
      const fileSizeMB = videoFile.size / (1024 * 1024);
      if (fileSizeMB > 20) {
        throw new Error(`影片檔案太大（${fileSizeMB.toFixed(1)}MB）。請壓縮到 20MB 以下，或裁剪影片長度。`);
      }

      setIsProcessing(false);
      setIsAnalyzing(true);

      const analysisParts = ['標準分析'];
      if (options.dualPersonality) analysisParts.push('雙人格教練分析');
      setStatusMessage(`正在送入 AI 進行${analysisParts.join(' + ')}...（可能需要 10-30 秒）`);

      // Call analysis API with video directly
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          handedness,
          dualPersonality: options.dualPersonality,
          video: videoBase64,
          mimeType: videoFile.type || 'video/mp4',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'API request failed');
      }

      const data = await response.json();
      setResults(data.items);
      setSummary(data.summary);
      if (data.dualPersonality) {
        setDualPersonality(data.dualPersonality);
      }
      setStatusMessage('分析完成！請查看下方報告。');
      setStatusType('ready');
    } catch (error: any) {
      console.error('Analysis error:', error);
      setStatusMessage(`錯誤：${error.message}`);
      setStatusType('error');
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  }, [videoFile, mode, handedness, options]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#9918;</span>
            <h1 className="text-xl font-bold text-white">AI 智慧教練</h1>
          </div>
          <span className="text-sm text-gray-400">棒壘球姿勢分析工具</span>
        </div>
      </header>

      {/* Subtitle */}
      <div className="bg-[#1a1a2e] px-4 py-3 text-center">
        <p className="text-gray-300 text-sm">
          AI 姿勢辨識輔助工具 · 投球／打擊／守備分析 · 結果僅供參考
        </p>
      </div>

      {/* Status Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div
          className={`rounded-lg p-3 text-sm font-medium ${
            statusType === 'ready'
              ? 'bg-green-900/50 border border-green-600 text-green-300'
              : statusType === 'processing'
              ? 'bg-blue-900/50 border border-blue-600 text-blue-300'
              : 'bg-red-900/50 border border-red-600 text-red-300'
          }`}
        >
          {statusType === 'ready' && '\u2705 '}
          {statusType === 'processing' && '\u23F3 '}
          {statusType === 'error' && '\u274C '}
          {statusMessage}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-1">
          <AnalysisSettings
            mode={mode}
            handedness={handedness}
            options={options}
            onModeChange={setMode}
            onHandednessChange={setHandedness}
            onOptionsChange={setOptions}
            onFileChange={handleFileChange}
            isAnalyzing={isProcessing || isAnalyzing}
            onAnalyze={handleAnalyze}
            hasVideo={!!videoFile}
          />
        </div>

        {/* Right: Video + Report */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            ref={videoPlayerRef}
            videoUrl={videoUrl}
            landmarks={landmarks}
            isProcessing={isProcessing}
          />
          <AnalysisReport
            results={results}
            isAnalyzing={isAnalyzing}
            summary={summary}
            dualPersonality={dualPersonality}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&#9432; 本工具由 AI 提供參考性建議，不代表專業教練指導，結果請自行評估</p>
      </footer>
    </main>
  );
}
