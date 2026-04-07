'use client';

import { useState, useRef, useCallback } from 'react';
import { AnalysisMode, Handedness, AnalysisResultItem, AnalysisOptions, Landmark, DualPersonalityReport } from '@/types';
import AnalysisSettings from '@/components/AnalysisSettings';
import VideoPlayer, { VideoPlayerHandle } from '@/components/VideoPlayer';
import AnalysisReport from '@/components/AnalysisReport';

/**
 * Read a file as base64 data URL.
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}

/**
 * Method A: Seek-based capture (works on desktop, may fail on iOS)
 */
function captureWithSeek(
  videoEl: HTMLVideoElement, canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D, w: number, h: number, maxFrames: number
): Promise<string[]> {
  return new Promise(async (resolve) => {
    const frames: string[] = [];
    const duration = videoEl.duration;
    const count = Math.min(maxFrames, Math.max(6, Math.ceil(duration * 5)));
    const interval = duration / (count + 1);

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
          frames.push(canvas.toDataURL('image/jpeg', 0.5));
        }
      } catch { break; } // If seek throws, stop and let Method B handle it
    }
    resolve(frames);
  });
}

/**
 * Method B: Play-based capture (works on iOS — no seeking required)
 * Plays the video and captures frames at intervals using requestAnimationFrame.
 */
function captureWithPlay(
  videoEl: HTMLVideoElement, canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D, w: number, h: number, maxFrames: number
): Promise<string[]> {
  return new Promise((resolve) => {
    const frames: string[] = [];
    const duration = videoEl.duration;
    const captureInterval = duration / (maxFrames + 1);
    let nextCaptureTime = captureInterval;
    let rafId: number;

    const wasMuted = videoEl.muted;
    const wasCurrentTime = videoEl.currentTime;
    videoEl.muted = true;
    videoEl.currentTime = 0;

    const capture = () => {
      if (videoEl.paused || videoEl.ended || frames.length >= maxFrames) {
        videoEl.pause();
        videoEl.muted = wasMuted;
        cancelAnimationFrame(rafId);
        resolve(frames);
        return;
      }

      if (videoEl.currentTime >= nextCaptureTime) {
        try {
          ctx.drawImage(videoEl, 0, 0, w, h);
          const px = ctx.getImageData(w >> 1, h >> 1, 1, 1).data;
          if (px[0] + px[1] + px[2] > 15) {
            frames.push(canvas.toDataURL('image/jpeg', 0.5));
          }
        } catch { /* skip */ }
        nextCaptureTime += captureInterval;
      }

      rafId = requestAnimationFrame(capture);
    };

    // Start playing
    videoEl.play().then(() => {
      rafId = requestAnimationFrame(capture);
    }).catch(() => {
      resolve(frames); // play() failed
    });

    // Safety timeout
    setTimeout(() => {
      videoEl.pause();
      videoEl.muted = wasMuted;
      cancelAnimationFrame(rafId);
      resolve(frames);
    }, Math.min(duration * 1000 + 2000, 30000));
  });
}

/**
 * Capture frames from the page's video element.
 * Tries seek-based first, falls back to play-based for iOS.
 */
function captureFromDomVideo(
  videoEl: HTMLVideoElement,
  maxFrames: number
): Promise<string[]> {
  return new Promise(async (resolve) => {
    const duration = videoEl.duration;
    if (!duration || !isFinite(duration) || duration <= 0) {
      resolve([]);
      return;
    }

    const w = Math.min(videoEl.videoWidth || 640, 480);
    const h = Math.round(w * ((videoEl.videoHeight || 480) / (videoEl.videoWidth || 640)));

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null;
    try {
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      ctx = canvas.getContext('2d');
    } catch {
      resolve([]);
      return;
    }
    if (!ctx) { resolve([]); return; }

    // Try Method A: seek-based (fast, precise)
    let frames = await captureWithSeek(videoEl, canvas, ctx, w, h, maxFrames);
    if (frames.length >= 3) {
      resolve(frames);
      return;
    }

    // Method A failed/insufficient — Try Method B: play-based (iOS compatible)
    console.log('Seek-based capture failed, trying play-based capture...');
    frames = await captureWithPlay(videoEl, canvas, ctx, w, h, maxFrames);
    resolve(frames);
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
    try {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    } catch {
      setVideoUrl(null);
    }
    setResults(null);
    setSummary(null);
    setDualPersonality(null);
    setLandmarks(null);
    setStatusMessage('影片已載入！建議先播放幾秒再點「開始分析」。');
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

    let images: string[] = [];

    // Step 1: Try frame extraction from DOM video
    try {
      setStatusMessage('步驟 1/3：從影片擷取關鍵幀...（請確認影片有先播放過）');
      const videoEl = videoPlayerRef.current?.getVideoElement();
      if (videoEl && videoEl.readyState >= 1) {
        images = await captureFromDomVideo(videoEl, 12);
      }
    } catch (e) {
      console.warn('DOM video capture failed:', e);
    }

    // Step 2: If no frames, try direct video upload (only for small files)
    if (images.length === 0) {
      const fileSizeMB = videoFile.size / (1024 * 1024);
      if (fileSizeMB <= 3.5) {
        // Small enough to send as base64 through Vercel
        try {
          setStatusMessage('步驟 1/3：改用影片直傳模式...');
          const base64 = await readFileAsBase64(videoFile);
          images = [base64];
        } catch {
          // fall through to error
        }
      }

      if (images.length === 0) {
        setStatusMessage(
          '錯誤：無法擷取影片畫面。請嘗試：\n' +
          '1. 上傳影片後先播放幾秒再點分析\n' +
          '2. 使用較短的影片（10 秒以內）\n' +
          '3. 使用 MP4 格式'
        );
        setStatusType('error');
        setIsProcessing(false);
        return;
      }
    }

    // Step 3: Send to AI
    try {
      setIsProcessing(false);
      setIsAnalyzing(true);

      const isVideo = images.length === 1 && images[0].startsWith('data:video');
      const analysisParts = ['標準分析'];
      if (options.dualPersonality) analysisParts.push('雙人格教練分析');

      setStatusMessage(
        isVideo
          ? `步驟 2/3：影片直傳 AI 分析中...（約 15-40 秒）`
          : `步驟 2/3：${images.length} 幀送入 AI 分析中...（約 10-30 秒）`
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
      if (data.dualPersonality) {
        setDualPersonality(data.dualPersonality);
      }
      setStatusMessage('步驟 3/3：分析完成！請查看下方報告。');
      setStatusType('ready');
    } catch (error: any) {
      console.error('API error:', error);
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
