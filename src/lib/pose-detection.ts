import { Landmark } from '@/types';

let poseLandmarker: any = null;
let initFailed = false;

export async function initPoseLandmarker(): Promise<boolean> {
  if (poseLandmarker) return true;
  if (initFailed) return false;

  try {
    const vision = await import('@mediapipe/tasks-vision');
    const { PoseLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Try GPU first, fallback to CPU
    try {
      poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    } catch {
      console.warn('GPU delegate failed, trying CPU...');
      poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    }
    return true;
  } catch (error) {
    console.warn('MediaPipe initialization failed, will use image-only mode:', error);
    initFailed = true;
    return false;
  }
}

export function detectPose(
  videoElement: HTMLVideoElement,
  timestampMs: number
): Landmark[] | null {
  if (!poseLandmarker) return null;

  try {
    const result = poseLandmarker.detectForVideo(videoElement, timestampMs);
    if (result.landmarks && result.landmarks.length > 0) {
      return result.landmarks[0].map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
      }));
    }
  } catch (error) {
    console.warn('Pose detection error:', error);
  }
  return null;
}

export interface FrameData {
  timestamp: number;
  landmarks: Landmark[] | null; // null when MediaPipe unavailable
  imageBase64: string;
}

/**
 * Wait for video to seek with timeout fallback for mobile browsers.
 */
function waitForSeek(video: HTMLVideoElement, targetTime: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, 3000);

    const onSeeked = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = targetTime;

    if (Math.abs(video.currentTime - targetTime) < 0.05) {
      cleanup();
      resolve();
    }
  });
}

/**
 * Check if a canvas frame is mostly black (failed capture).
 */
function isFrameBlack(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const sampleSize = 20;
  const stepX = Math.floor(width / sampleSize);
  const stepY = Math.floor(height / sampleSize);
  let darkPixels = 0;
  let totalPixels = 0;

  for (let x = 0; x < width; x += stepX) {
    for (let y = 0; y < height; y += stepY) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      totalPixels++;
      if (pixel[0] < 10 && pixel[1] < 10 && pixel[2] < 10) {
        darkPixels++;
      }
    }
  }

  return darkPixels / totalPixels > 0.9;
}

/**
 * Extract video frames with optional pose detection.
 * Always captures frame images — pose landmarks are a bonus when MediaPipe works.
 */
export async function extractKeyFrames(
  videoElement: HTMLVideoElement,
  onProgress?: (frame: FrameData, index: number, total: number) => void,
  maxFrames: number = 20,
  usePoseDetection: boolean = true
): Promise<FrameData[]> {
  const frames: FrameData[] = [];
  const duration = videoElement.duration;

  if (!duration || !isFinite(duration)) {
    throw new Error('無法取得影片長度');
  }

  // CRITICAL: On mobile browsers, video must be played first before frames can be captured.
  // Without this, canvas.drawImage() returns black frames.
  videoElement.muted = true;
  try {
    await videoElement.play();
    // Let it play briefly to initialize the decoder
    await new Promise((r) => setTimeout(r, 500));
    videoElement.pause();
  } catch (e) {
    console.warn('Auto-play failed, trying with user gesture context:', e);
  }

  const totalFrames = Math.min(Math.ceil(duration / 0.1), maxFrames);
  const interval = duration / totalFrames;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d')!;

  let blackFrameCount = 0;

  for (let i = 0; i < totalFrames; i++) {
    const time = Math.min(i * interval, duration - 0.01);

    try {
      await waitForSeek(videoElement, time);
    } catch {
      continue; // skip this frame if seek fails
    }
    // Longer delay for mobile to render the video frame
    await new Promise((r) => setTimeout(r, 200));

    // Capture frame image
    try {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    } catch {
      continue; // skip if drawImage fails (CORS, etc.)
    }

    // Check if frame is black (failed capture)
    if (isFrameBlack(ctx, canvas.width, canvas.height)) {
      blackFrameCount++;
      // If first few frames are all black, try playing to the timestamp instead
      if (blackFrameCount <= 3) {
        try {
          videoElement.currentTime = time;
          videoElement.muted = true;
          await videoElement.play();
          await new Promise((r) => setTimeout(r, 300));
          videoElement.pause();
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        } catch {
          // ignore play errors
        }
      }

      // Still black? skip this frame
      if (isFrameBlack(ctx, canvas.width, canvas.height)) {
        continue;
      }
    }

    let imageBase64: string;
    try {
      imageBase64 = canvas.toDataURL('image/jpeg', 0.6);
    } catch {
      // toDataURL can fail on some mobile browsers — try PNG fallback
      try {
        imageBase64 = canvas.toDataURL('image/png');
      } catch {
        continue; // skip this frame entirely
      }
    }

    // Try pose detection (optional)
    let landmarks: Landmark[] | null = null;
    if (usePoseDetection && poseLandmarker) {
      const timestampMs = Math.round(time * 1000);
      landmarks = detectPose(videoElement, timestampMs);
    }

    const frame: FrameData = { timestamp: time, landmarks, imageBase64 };
    frames.push(frame);
    onProgress?.(frame, i, totalFrames);
  }

  // If ALL frames were black, throw a specific error
  if (frames.length === 0 && blackFrameCount > 0) {
    throw new Error(
      '影片擷取失敗（畫面全黑）。請嘗試：\n' +
      '1. 先播放影片幾秒後再點分析\n' +
      '2. 或換一個影片格式（建議 MP4 H.264）'
    );
  }

  return frames;
}

/**
 * Select representative key frames for AI analysis.
 */
export function selectKeyFrames(frames: FrameData[], count: number = 6): FrameData[] {
  if (frames.length <= count) return frames;

  const step = Math.floor(frames.length / count);
  const selected: FrameData[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(frames[Math.min(i * step, frames.length - 1)]);
  }
  return selected;
}
