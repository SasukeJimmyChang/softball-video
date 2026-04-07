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

  const totalFrames = Math.min(Math.ceil(duration / 0.1), maxFrames);
  const interval = duration / totalFrames;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < totalFrames; i++) {
    const time = Math.min(i * interval, duration - 0.01);

    await waitForSeek(videoElement, time);
    // Small delay to let the video frame render on mobile
    await new Promise((r) => setTimeout(r, 80));

    // Capture frame image
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);

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
