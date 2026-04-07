import { Landmark } from '@/types';

let poseLandmarker: any = null;
let isInitializing = false;

export async function initPoseLandmarker(): Promise<void> {
  if (poseLandmarker || isInitializing) return;
  isInitializing = true;

  try {
    const vision = await import('@mediapipe/tasks-vision');
    const { PoseLandmarker, FilesetResolver } = vision;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Try GPU first, fallback to CPU (mobile Safari often fails with GPU)
    let landmarker: any = null;
    try {
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    } catch {
      console.warn('GPU delegate failed, falling back to CPU');
      landmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
    }

    poseLandmarker = landmarker;
  } catch (error) {
    console.error('Failed to initialize PoseLandmarker:', error);
    throw new Error('骨架偵測模型載入失敗，請重新整理頁面再試');
  } finally {
    isInitializing = false;
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
    console.error('Pose detection error:', error);
  }
  return null;
}

export function isReady(): boolean {
  return poseLandmarker !== null;
}

export interface FrameData {
  timestamp: number;
  landmarks: Landmark[];
  imageBase64: string;
}

/**
 * Wait for video to seek to a specific time.
 * Mobile Safari's onseeked is unreliable, so we use a polling fallback with timeout.
 */
function waitForSeek(video: HTMLVideoElement, targetTime: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      // On timeout, resolve anyway — the frame might be close enough
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

    // If already at the target time, resolve immediately
    if (Math.abs(video.currentTime - targetTime) < 0.05) {
      cleanup();
      resolve();
    }
  });
}

/**
 * Process video frames and extract pose landmarks + frame images.
 * Uses adaptive frame interval based on video duration.
 */
export async function extractKeyFrames(
  videoElement: HTMLVideoElement,
  onProgress?: (frame: FrameData, index: number, total: number) => void,
  maxFrames: number = 30
): Promise<FrameData[]> {
  const frames: FrameData[] = [];
  const duration = videoElement.duration;

  if (!duration || !isFinite(duration)) {
    throw new Error('無法取得影片長度');
  }

  // Adaptive interval: for short clips use 0.1s, for longer clips use wider interval
  const rawFrameCount = Math.ceil(duration / 0.1);
  const totalFrames = Math.min(rawFrameCount, maxFrames);
  const interval = duration / totalFrames;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d')!;

  let consecutiveFailures = 0;

  for (let i = 0; i < totalFrames; i++) {
    const time = Math.min(i * interval, duration - 0.01);

    try {
      await waitForSeek(videoElement, time);
    } catch {
      consecutiveFailures++;
      if (consecutiveFailures > 5) {
        console.warn('Too many seek failures, stopping frame extraction');
        break;
      }
      continue;
    }

    // Small delay to let the video frame render
    await new Promise((r) => setTimeout(r, 50));

    const timestampMs = Math.round(time * 1000);
    const landmarks = detectPose(videoElement, timestampMs);

    if (landmarks) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);

      const frame: FrameData = {
        timestamp: time,
        landmarks,
        imageBase64,
      };
      frames.push(frame);
      consecutiveFailures = 0;
      onProgress?.(frame, frames.length - 1, totalFrames);
    } else {
      consecutiveFailures++;
      if (consecutiveFailures > 10) {
        console.warn('Too many detection failures, stopping');
        break;
      }
    }
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
