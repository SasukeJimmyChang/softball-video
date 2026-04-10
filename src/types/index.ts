export type AnalysisMode = 'pitching' | 'batting' | 'fielding';
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

export interface DualPersonalityReport {
  encouragingCoach: {
    strengths: string[];
    suggestedLineup: string;
    suggestedPosition?: string;
    ratings: PlayerRating[];
    fieldingRatings?: FieldingPlayerRating[];
  };
  harshScout: {
    weaknesses: string[];
    suggestedLineup: string;
    suggestedPosition?: string;
    ratings: PlayerRating[];
    fieldingRatings?: FieldingPlayerRating[];
  };
}

export interface PlayerRating {
  name: string;
  power: number;      // 爆
  accuracy: number;   // 準
  stability: number;  // 穩
  coordination: number; // 協
  aggression: number; // 積極
}

export interface FieldingPlayerRating {
  name: string;
  reaction: number;   // 反應
  gloveWork: number;  // 手套技巧
  footwork: number;   // 腳步
  throwing: number;   // 傳球
  stability: number;  // 穩定
}

export interface AnalysisResult {
  mode: AnalysisMode;
  handedness: Handedness;
  items: AnalysisResultItem[];
  summary: string;
  dualPersonality?: DualPersonalityReport;
}

export type SkillLevel = 'beginner' | 'advanced';

export interface AnalysisOptions {
  dualPersonality: boolean;
  skillLevel: SkillLevel;
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
