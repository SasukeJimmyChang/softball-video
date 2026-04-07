'use client';

import { useState, useRef, useCallback } from 'react';
import { AnalysisMode, Handedness, AnalysisResultItem, AnalysisOptions, Landmark, DualPersonalityReport } from '@/types';
import AnalysisSettings from '@/components/AnalysisSettings';
import VideoPlayer, { VideoPlayerHandle } from '@/components/VideoPlayer';
import AnalysisReport from '@/components/AnalysisReport';

/**
 * Extract frames from a video File using a dedicated offscreen video element.
 * This avoids all the mobile issues with the DOM video element.
 */
async function extractFramesFromFile(file: File, maxFrames: number = 20): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    // Do NOT set crossOrigin — blob URLs don't support CORS and it causes errors on mobile

    const url = URL.createObjectURL(file);
    video.src = url;

    const cleanup = () => {
      try { URL.revokeObjectURL(url); } catch {}
      try { video.remove(); } catch {}
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('影片載入失敗，請確認影片格式正確（建議 MP4）'));
    };

    video.onloadeddata = async () => {
      try {
        const duration = video.duration;
        if (!duration || !isFinite(duration) || duration <= 0) {
          throw new Error('無法取得影片長度');
        }

        // 10fps sampling, capped at maxFrames
        const frameCount = Math.min(maxFrames, Math.ceil(duration * 10));
        const interval = duration / (frameCount + 1);

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 640, 960);
        canvas.height = Math.round((canvas.width / (video.videoWidth || 640)) * (video.videoHeight || 480));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 初始化失敗');

        const frames: string[] = [];

        for (let i = 1; i <= frameCount; i++) {
          const time = Math.min(i * interval, duration - 0.1);

          // Seek to time — wrapped in try-catch for mobile safety
          try {
            video.currentTime = time;
          } catch (seekErr) {
            console.warn(`[frame ${i}] seek failed:`, seekErr);
            continue;
          }

          await new Promise<void>((res) => {
            const timer = setTimeout(res, 2000);
            const onSeeked = () => {
              clearTimeout(timer);
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked);
          });

          await new Promise((r) => setTimeout(r, 150));

          // Capture frame
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Quick black frame check
            const centerPixel = ctx.getImageData(
              Math.floor(canvas.width / 2),
              Math.floor(canvas.height / 2),
              1, 1
            ).data;
            const isTotallyBlack = centerPixel[0] + centerPixel[1] + centerPixel[2] < 15;

            if (!isTotallyBlack) {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              frames.push(dataUrl);
            }
          } catch (captureErr) {
            console.warn(`[frame ${i}] capture failed:`, captureErr);
          }
        }

        cleanup();
        resolve(frames);
      } catch (e) {
        cleanup();
        reject(e);
      }
    };
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
      setStatusMessage('正在從影片擷取關鍵幀...');
      setStatusType('processing');

      let frames: string[];
      try {
        frames = await extractFramesFromFile(videoFile, 20);
      } catch (extractErr: any) {
        throw new Error(`影格擷取失敗（${extractErr.message}）。請嘗試用 MP4 格式的影片。`);
      }

      if (frames.length === 0) {
        throw new Error(
          '無法從影片擷取畫面（全為黑畫面）。請嘗試：\n' +
          '1. 使用 MP4 H.264 格式的影片\n' +
          '2. 影片長度至少 1 秒以上'
        );
      }

      setIsProcessing(false);
      setIsAnalyzing(true);

      const analysisParts = ['標準分析'];
      if (options.dualPersonality) analysisParts.push('雙人格教練分析');
      setStatusMessage(`已擷取 ${frames.length} 幀，正在送入 AI 進行${analysisParts.join(' + ')}...（約 10-30 秒）`);

      // Call analysis API with frame images
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          handedness,
          dualPersonality: options.dualPersonality,
          images: frames,
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
      <header className="bg-[#1a1a2e] border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#9918;</span>
            <h1 className="text-xl font-bold text-white">AI 智慧教練</h1>
          </div>
          <span className="text-sm text-gray-400">棒壘球姿勢分析工具</span>
        </div>
      </header>

      <div className="bg-[#1a1a2e] px-4 py-3 text-center">
        <p className="text-gray-300 text-sm">
          AI 姿勢辨識輔助工具 · 投球／打擊／守備分析 · 結果僅供參考
        </p>
      </div>

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

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&#9432; 本工具由 AI 提供參考性建議，不代表專業教練指導，結果請自行評估</p>
      </footer>
    </main>
  );
}
