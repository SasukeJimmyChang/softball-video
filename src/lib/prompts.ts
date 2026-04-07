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

type FrameInput = { timestamp: number; landmarks: Array<{ x: number; y: number; z: number; visibility: number }> | null };

function formatLandmarks(frames: FrameInput[]): string | null {
  const withLandmarks = frames.filter((f) => f.landmarks && f.landmarks.length > 0);
  if (withLandmarks.length === 0) return null;
  return JSON.stringify(
    withLandmarks.map((f) => ({
      t: Math.round(f.timestamp * 100) / 100,
      lm: f.landmarks!.map((l) => ({
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
  landmarksData: FrameInput[]
): string {
  const modeLabel = getModeLabel(mode);
  const handLabel = getHandLabel(mode, handedness);
  const itemsDesc = buildItemsDescription(mode);
  const landmarksJson = formatLandmarks(landmarksData);
  const totalItems = mode === 'fielding' ? '17' : '21';

  const landmarksSection = landmarksJson
    ? `\n## 骨架關鍵點座標（MediaPipe 33 landmarks，每幀）\n${landmarksJson}\n`
    : '';

  return `你是一位擁有 20 年經驗的頂尖棒壘球${modeLabel}動作分析教練。你以嚴格、精準、不留情面著稱。
你的任務是根據提供的影格圖片，仔細分析這位${handLabel}選手的${modeLabel}動作。

## 重要：你必須嚴格評分
- 這些是業餘選手的影片，幾乎不可能所有項目都是「優良」
- **一般業餘選手通常有 40-60% 的項目需要改進（red 或 orange）**
- 如果你的分析結果超過 70% 是 green，代表你的評分太寬鬆，請重新評估
- 請仔細觀察圖片中的每一個細節：關節角度、身體對齊、重心位置、動作幅度
- 每個項目都必須給出具體的觀察依據，不能用「看起來還行」這種模糊評語
${landmarksSection}

## 分析項目（共 ${getItemCount(mode)}）
${itemsDesc}

## 分析方法
1. **仔細觀察每張圖片**：注意手肘角度、膝蓋彎曲度、肩線傾斜、頭部位置、腳步寬度
2. **比較不同時間點**：前期準備 → 動作中 → 跟進收尾，觀察動作的連貫性
3. **與理想標準比對**：每個項目描述中有理想範圍，嚴格比對實際與理想的差距
4. **找出具體問題**：不要泛泛而談，要指出「肘部角度約 X°，偏離理想 Y°」這類具體描述

## 輸出格式要求
請以 JSON 格式回傳分析結果：
\`\`\`json
{
  "summary": "50 字以內的整體評語，必須指出 2-3 個最關鍵的問題",
  "items": [
    {
      "id": "${mode === 'fielding' ? 'F-01' : mode === 'pitching' ? 'P-01' : 'B-01'}",
      "name": "項目名稱",
      "status": "red|orange|green|blue",
      "comment": "具體觀察描述，包含角度、位置等細節（20-50字）"
    }
  ]
}
\`\`\`

## 色碼標準（嚴格版）
- **red（需改進）**：明顯偏離理想範圍 >20%，有受傷風險或嚴重影響表現。業餘選手通常有 3-5 個 red。
- **orange（需注意）**：偏離理想範圍 10-20%，建議優先調整。業餘選手通常有 5-8 個 orange。
- **green（優良）**：在理想範圍 ±10% 內。只有確實做得好的項目才能給 green。
- **blue（提示）**：無法從圖片中清楚判斷，或需要更多角度確認。

## 規則
1. 必須分析所有 ${totalItems} 個項目，不可遺漏
2. 每個 comment 必須包含你在圖片中觀察到的**具體事實**
3. 如果從圖片角度無法判斷某個項目，使用 blue（提示）而不是 green
4. 時序項目(T/FT)需要比較多幀之間的變化
5. 只回傳 JSON，不要加其他文字
6. 再次強調：不要當好好先生，要做一個嚴格的教練`;
}

export function buildDualPersonalityPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  landmarksData: FrameInput[]
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

${landmarksJson ? `## 骨架關鍵點座標（MediaPipe 33 landmarks，每幀）\n${landmarksJson}\n` : ''}
## 分析要求
請根據影格圖片${landmarksJson ? '和骨架數據' : ''}，進行雙人格分析。

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
