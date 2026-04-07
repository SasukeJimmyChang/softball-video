import { AnalysisMode, Handedness } from '@/types';
import { pitchingItems, battingItems, fieldingItems } from './analysis-items';

function getItems(mode: AnalysisMode) {
  if (mode === 'pitching') return pitchingItems;
  if (mode === 'batting') return battingItems;
  return fieldingItems;
}

function buildItemsDescription(mode: AnalysisMode): string {
  return getItems(mode)
    .map((item) => `- ${item.id} ${item.name}：${item.description}`)
    .join('\n');
}

function getModeLabel(mode: AnalysisMode): string {
  if (mode === 'pitching') return '投球';
  if (mode === 'batting') return '打擊';
  return '守備（接滾地球）';
}

function getHandLabel(mode: AnalysisMode, handedness: Handedness): string {
  if (mode === 'pitching') return handedness === 'right' ? '右投' : '左投';
  if (mode === 'batting') return handedness === 'right' ? '右打' : '左打';
  return handedness === 'right' ? '右手' : '左手';
}

function getItemCount(mode: AnalysisMode): string {
  if (mode === 'fielding') return '14 項靜態 + 3 項時序';
  return '18 項靜態 + 3 項時序';
}

function formatLandmarks(
  landmarksData: Array<{ timestamp: number; landmarks: Array<{ x: number; y: number; z: number; visibility: number }> }>
): string {
  return JSON.stringify(
    landmarksData.map((f) => ({
      t: Math.round(f.timestamp * 100) / 100,
      lm: f.landmarks.map((l) => ({
        x: Math.round(l.x * 1000) / 1000,
        y: Math.round(l.y * 1000) / 1000,
        z: Math.round(l.z * 1000) / 1000,
        v: Math.round(l.visibility * 100) / 100,
      })),
    }))
  );
}

export function buildAnalysisPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  landmarksData: Array<{ timestamp: number; landmarks: Array<{ x: number; y: number; z: number; visibility: number }> }>
): string {
  const modeLabel = getModeLabel(mode);
  const handLabel = getHandLabel(mode, handedness);
  const itemsDesc = buildItemsDescription(mode);
  const landmarksJson = formatLandmarks(landmarksData);
  const totalItems = mode === 'fielding' ? '17' : '21';

  return `你是一位專業的棒壘球${modeLabel}動作分析教練 AI。
請根據提供的影格圖片和 MediaPipe Pose 骨架關鍵點座標，分析這位${handLabel}選手的${modeLabel}動作。

## 骨架關鍵點座標（MediaPipe 33 landmarks，每幀）
${landmarksJson}

## 分析項目（共 ${getItemCount(mode)}）
${itemsDesc}

## 輸出格式要求
請以 JSON 格式回傳分析結果，格式如下：
\`\`\`json
{
  "summary": "一段 50 字以內的整體動作評語",
  "items": [
    {
      "id": "${mode === 'fielding' ? 'F-01' : mode === 'pitching' ? 'P-01' : 'B-01'}",
      "name": "項目名稱",
      "status": "red|orange|green|blue",
      "comment": "針對此項目的具體分析評語（20-40字）"
    }
  ]
}
\`\`\`

## 色碼標準
- **red（需改進）**：明顯偏離理想範圍，有受傷風險或嚴重影響表現
- **orange（需注意）**：略微偏離理想範圍，建議調整
- **green（優良）**：在理想範圍內，表現良好
- **blue（提示）**：參考性建議，非必要修正

## 重要提醒
1. 必須分析所有 ${totalItems} 個項目，不可遺漏
2. 根據圖片中實際看到的姿勢進行客觀判斷
3. 時序項目需要比較多幀之間的變化
4. 結果僅供參考，不代表專業教練指導
5. 只回傳 JSON，不要加其他文字`;
}

export function buildDualPersonalityPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  landmarksData: Array<{ timestamp: number; landmarks: Array<{ x: number; y: number; z: number; visibility: number }> }>
): string {
  const modeLabel = getModeLabel(mode);
  const handLabel = getHandLabel(mode, handedness);
  const landmarksJson = formatLandmarks(landmarksData);

  const ratingLabels = mode === 'fielding'
    ? '反應(反)、手套技巧(套)、腳步(步)、傳球(傳)、穩定(穩)'
    : '爆發力(爆)、準確度(準)、穩定度(穩)、協調性(協)、積極度(積極)';

  const ratingKeys = mode === 'fielding'
    ? '"reaction", "gloveWork", "footwork", "throwing", "stability"'
    : '"power", "accuracy", "stability", "coordination", "aggression"';

  return `【角色設定】你是一位具備雙重人格的壘球專家。請針對提供的${modeLabel}影片進行分析，分成兩個獨立的部分回覆。

## 球員資訊
- 模式：${modeLabel}
- 慣用手：${handLabel}

## 骨架關鍵點座標（MediaPipe 33 landmarks，每幀）
${landmarksJson}

## 分析要求
請根據影格圖片和骨架數據，進行雙人格分析。

### 數據過濾
- 測速槍數值若超過 150 請視為 Bug 忽略

## 輸出格式要求
請以 JSON 格式回傳，格式如下：
\`\`\`json
{
  "encouragingCoach": {
    "title": "鼓勵教練的溫馨報告",
    "strengths": [
      "優點1：具體描述（30-50字）",
      "優點2：具體描述（30-50字）",
      "優點3：具體描述（30-50字）"
    ],
    "suggestedLineup": "根據 Sabermetrics 邏輯（最強第二棒），建議的棒次安排說明（50-100字）",
    "ratings": [
      {
        "name": "選手",
        ${ratingKeys.split(', ').map(k => `${k}: 85`).join(',\n        ')}
      }
    ],
    "encouragement": "一段溫暖、肯定潛力的鼓勵話語（50-80字）"
  },
  "harshScout": {
    "title": "毒舌球探的殘酷實話",
    "weaknesses": [
      "致命缺點1：殘酷但精準的描述（30-50字）",
      "致命缺點2：殘酷但精準的描述（30-50字）",
      "致命缺點3：殘酷但精準的描述（30-50字）"
    ],
    "suggestedLineup": "以「誰最不爛」為邏輯的棒次安排說明（50-100字）",
    "ratings": [
      {
        "name": "選手",
        ${ratingKeys.split(', ').map(k => `${k}: 45`).join(',\n        ')}
      }
    ],
    "roast": "一段冷酷、毒舌但有道理的評語（50-80字）"
  }
}
\`\`\`

## 能力評分標準（${ratingLabels}）
- 分數範圍 0-100
- 鼓勵教練：適度高估，但仍基於事實
- 毒舌球探：嚴苛評分，絕不手軟

## 重要提醒
1. 鼓勵教練：以肯定、發掘潛力、高情緒價值為主
2. 毒舌球探：拒絕虛偽，以冷酷、殘酷、Sabermetrics 邏輯為主
3. 兩個角色的分析必須獨立，不可互相影響
4. 所有表格必須精簡，確保手機垂直螢幕截圖不跑版
5. 只回傳 JSON，不要加其他文字`;
}
