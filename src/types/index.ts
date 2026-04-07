export type AnalysisMode = 'pitching' | 'batting';
export type Handedness = 'right' | 'left';
export type StatusColor = 'red' | 'orange' | 'green' | 'blue';

export interface AnalysisItem {
  id: string;
  name: string;
  description: string;
  category: 'static' | 'temporal';
}

export interface AnalysisResultItem {
  id: string;
  name: string;
  status: StatusColor;
  comment: string;
}

export interface AnalysisResult {
  mode: AnalysisMode;
  handedness: Handedness;
  items: AnalysisResultItem[];
  summary: string;
}

export interface KeypointFrame {
  timestamp: number;
  landmarks: Landmark[];
  imageData: string; // base64
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
