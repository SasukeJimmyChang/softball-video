'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Landmark } from '@/types';

// MediaPipe Pose connections for drawing skeleton
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // arms
  [11, 23], [12, 24], [23, 24], // torso
  [23, 25], [25, 27], [24, 26], [26, 28], // legs
  [15, 17], [15, 19], [15, 21], [16, 18], [16, 20], [16, 22], // hands
  [27, 29], [27, 31], [28, 30], [28, 32], // feet
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], // face
  [9, 10], // mouth
];

export interface VideoPlayerHandle {
  captureFrame: () => string | null;
  getVideoElement: () => HTMLVideoElement | null;
}

interface VideoPlayerProps {
  videoUrl: string | null;
  landmarks: Landmark[] | null;
  isProcessing: boolean;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ videoUrl, landmarks, isProcessing }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        if (!video) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      },
      getVideoElement: () => videoRef.current,
    }));

    const drawLandmarks = useCallback(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !landmarks) return;

      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width;
      const scaleY = canvas.height;

      // Draw connections
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      for (const [i, j] of POSE_CONNECTIONS) {
        if (i >= landmarks.length || j >= landmarks.length) continue;
        const a = landmarks[i];
        const b = landmarks[j];
        if (a.visibility < 0.5 || b.visibility < 0.5) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * scaleX, a.y * scaleY);
        ctx.lineTo(b.x * scaleX, b.y * scaleY);
        ctx.stroke();
      }

      // Draw points
      for (const lm of landmarks) {
        if (lm.visibility < 0.5) continue;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(lm.x * scaleX, lm.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }, [landmarks]);

    useEffect(() => {
      drawLandmarks();
    }, [drawLandmarks]);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 text-white font-bold flex items-center gap-2">
          <span>&#127909;</span> 影片畫面
        </div>
        <div className="relative bg-black aspect-video">
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-4xl mb-2">&#127910;</div>
              <p>上傳影片後顯示骨架</p>
              <p>與問題標記</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
              骨架偵測中...
            </div>
          )}
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
