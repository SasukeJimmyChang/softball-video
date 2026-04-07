import { AnalysisMode, Handedness } from '@/types';
import { pitchingItems, battingItems } from './analysis-items';

function buildItemsDescription(mode: AnalysisMode): string {
  const items = mode === 'pitching' ? pitchingItems : battingItems;
  return items
    .map((item) => `- ${item.id} ${item.name}：${item.description}`)
    .join('\n');
}

export function buildAnalysisPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  landmarksData: Array<{ timestamp: number; landmarks: Array<{ x: number; y: number; z: number; visibility: number }> }>
): string {
  const modeLabel = mode === 'pitching' ? '投球' : '打擊';
  const handLabel = handedness === 'right'
    ? (mode === 'pitching' ? '右投' : '右打')
    : (mode === 'pitching' ? '左投' : '左打');

  const itemsDesc = buildItemsDescription(mode);

  const landmarksJson = JSON.stringify(
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

  return `你是一位專業的棒壘球${modeLabel}動作分析教練 AI。
請根據提供的影格圖片和 MediaPipe Pose 骨架關鍵點座標，分析這位${handLabel}選手的${modeLabel}動作。

## 骨架關鍵點座標（MediaPipe 33 landmarks，每幀）
${landmarksJson}

## 分析項目（共 ${mode === 'pitching' ? '18 項靜態 + 3 項時序' : '18 項靜態 + 3 項時序'}）
${itemsDesc}

## 輸出格式要求
請以 JSON 格式回傳分析結果，格式如下：
\`\`\`json
{
  "summary": "一段 50 字以內的整體動作評語",
  "items": [
    {
      "id": "P-01",
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
1. 必須分析所有 ${mode === 'pitching' ? '21' : '21'} 個項目，不可遺漏
2. 根據圖片中實際看到的姿勢進行客觀判斷
3. 時序項目 (T-xx) 需要比較多幀之間的變化
4. 結果僅供參考，不代表專業教練指導
5. 只回傳 JSON，不要加其他文字`;
}
