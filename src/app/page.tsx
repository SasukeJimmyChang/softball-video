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
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}

/**
 * Capture high-quality frames via seek (desktop) or play (iOS fallback).
 */
async function captureFrames(videoEl: HTMLVideoElement, maxFrames: number): Promise<string[]> {
  const duration = videoEl.duration;
  if (!duration || !isFinite(duration) || duration <= 0) return [];

  const w = Math.min(videoEl.videoWidth || 640, 720);
  const h = Math.round(w * ((videoEl.videoHeight || 480) / (videoEl.videoWidth || 640)));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const count = Math.min(maxFrames, Math.max(6, Math.ceil(duration * 10)));
  const interval = duration / (count + 1);

  // Try seek-based first
  let frames: string[] = [];
  for (let i = 1; i <= count; i++) {
    try {
      videoEl.currentTime = Math.min(i * interval, duration - 0.05);
      await new Promise<void>((res) => {
        const t = setTimeout(res, 2500);
        videoEl.addEventListener('seeked', () => { clearTimeout(t); res(); }, { once: true });
      });
      await new Promise((r) => setTimeout(r, 120));
      ctx.drawImage(videoEl, 0, 0, w, h);
      const px = ctx.getImageData(w >> 1, h >> 1, 1, 1).data;
      if (px[0] + px[1] + px[2] > 15) {
        frames.push(canvas.toDataURL('image/jpeg', 0.75));
      }
    } catch { break; }
  }
  if (frames.length >= 3) return frames;

  // Fallback: play-based capture for iOS
  frames = [];
  return new Promise((resolve) => {
    const captureInterval = duration / (maxFrames + 1);
    let nextTime = captureInterval;
    let rafId: number;
    videoEl.muted = true;
    videoEl.currentTime = 0;

    const tick = () => {
      if (videoEl.paused || videoEl.ended || frames.length >= maxFrames) {
        videoEl.pause(); cancelAnimationFrame(rafId); resolve(frames); return;
      }
      if (videoEl.currentTime >= nextTime) {
        try {
          ctx.drawImage(videoEl, 0, 0, w, h);
          const px = ctx.getImageData(w >> 1, h >> 1, 1, 1).data;
          if (px[0] + px[1] + px[2] > 15) frames.push(canvas.toDataURL('image/jpeg', 0.75));
        } catch {}
        nextTime += captureInterval;
      }
      rafId = requestAnimationFrame(tick);
    };

    videoEl.play().then(() => { rafId = requestAnimationFrame(tick); }).catch(() => resolve(frames));
    setTimeout(() => { videoEl.pause(); cancelAnimationFrame(rafId); resolve(frames); },
      Math.min(duration * 1000 + 2000, 30000));
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
  const [statusMessage, setStatusMessage] = useState<string>('AI 已就緒！請上傳單次揮擊/投球的短片（2-10 秒最佳）。');
  const [statusType, setStatusType] = useState<'ready' | 'processing' | 'error'>('ready');

  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  const handleFileChange = useCallback((file: File) => {
    setVideoFile(file);
    try {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    } catch { setVideoUrl(null); }
    setResults(null);
    setSummary(null);
    setDualPersonality(null);
    setLandmarks(null);

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 10) {
      setStatusMessage(`影片 ${sizeMB.toFixed(0)}MB 較大，建議裁剪為單次揮擊短片（2-10 秒）以提高分析精度。`);
    } else {
      setStatusMessage('影片已載入！建議先播放確認後再點「開始分析」。');
    }
    setStatusType('ready');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setIsAnalyzing(false);
    setResults(null);
    setSummary(null);
    setDualPersonality(null);
    setStatusType('processing');

    const fileSizeMB = videoFile.size / (1024 * 1024);
    let images: string[] = [];
    let uploadMode: 'video' | 'frames' = 'frames';

    try {
      // Strategy: small files → send video directly (most accurate)
      //           large files → extract frames
      if (fileSizeMB <= 3.5) {
        // Small file: send entire video to Gemini (best quality, full motion)
        setStatusMessage('正在讀取影片...(影片直傳模式，分析最精準)');
        const base64 = await readFileAsBase64(videoFile);
        images = [base64];
        uploadMode = 'video';
      } else {
        // Large file: extract frames
        setStatusMessage('正在從影片擷取關鍵幀...(建議播放過影片再分析)');
        const videoEl = videoPlayerRef.current?.getVideoElement();
        if (videoEl && videoEl.readyState >= 1) {
          images = await captureFrames(videoEl, 8);
        }
      }

      if (images.length === 0) {
        throw new Error(
          '無法處理影片。建議：\n' +
          '1. 裁剪為單次揮擊短片（2-10 秒，<10MB）\n' +
          '2. 上傳後先播放幾秒再分析\n' +
          '3. 使用 MP4 格式'
        );
      }

      setIsProcessing(false);
      setIsAnalyzing(true);

      const analysisParts = ['標準分析'];
      if (options.dualPersonality) analysisParts.push('雙人格教練分析');

      setStatusMessage(
        uploadMode === 'video'
          ? `影片直傳 AI 分析中（最精準模式）...約 15-40 秒`
          : `${images.length} 幀送入 AI 分析中...約 10-30 秒`
      );

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          handedness,
          dualPersonality: options.dualPersonality,
          images,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || `伺服器錯誤 ${response.status}`);
      }

      const data = await response.json();
      setResults(data.items);
      setSummary(data.summary);
      if (data.dualPersonality) setDualPersonality(data.dualPersonality);
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

      {/* Tips banner */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-xs text-blue-300">
          <strong>&#128161; 最佳使用方式：</strong>上傳單次揮擊/投球的短片（2-10 秒），分析結果最精準穩定。長影片請先裁剪再上傳。
        </div>
      </div>

      {/* Status Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-2">
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
