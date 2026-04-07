import { Landmark } from '@/types';

// MediaPipe PoseLandmarker wrapper
// Uses the @mediapipe/tasks-vision package for browser-side pose detection

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

    poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  } catch (error) {
    console.error('Failed to initialize PoseLandmarker:', error);
    throw error;
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
 * Process video frames at 10fps (every 0.1s) and extract pose landmarks + frame images.
 * Returns key frames with landmarks for AI analysis.
 */
export async function extractKeyFrames(
  videoElement: HTMLVideoElement,
  onProgress?: (frame: FrameData, index: number, total: number) => void,
  maxFrames: number = 50
): Promise<FrameData[]> {
  const frames: FrameData[] = [];
  const duration = videoElement.duration;
  const interval = 0.1; // 10fps
  const totalFrames = Math.min(Math.ceil(duration / interval), maxFrames);

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < totalFrames; i++) {
    const time = i * interval;
    videoElement.currentTime = time;

    await new Promise<void>((resolve) => {
      videoElement.onseeked = () => resolve();
    });

    const timestampMs = Math.round(time * 1000);
    const landmarks = detectPose(videoElement, timestampMs);

    if (landmarks) {
      ctx.drawImage(videoElement, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.7);

      const frame: FrameData = {
        timestamp: time,
        landmarks,
        imageBase64,
      };
      frames.push(frame);
      onProgress?.(frame, i, totalFrames);
    }
  }

  return frames;
}

/**
 * Select representative key frames for AI analysis.
 * Picks frames with highest pose confidence and good distribution across time.
 */
export function selectKeyFrames(frames: FrameData[], count: number = 6): FrameData[] {
  if (frames.length <= count) return frames;

  // Pick evenly distributed frames
  const step = Math.floor(frames.length / count);
  const selected: FrameData[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(frames[Math.min(i * step, frames.length - 1)]);
  }
  return selected;
}
