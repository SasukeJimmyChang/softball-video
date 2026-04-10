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

function getPhaseGuide(mode: AnalysisMode): string {
  if (mode === 'batting') {
    return `## 打擊動作五階段（請依序分析）
1. **預備站姿 (Stance)**：站距、膝蓋彎曲、備棒位置、重心分配
2. **啟動 (Load)**：重心後移、手部回拉、前腳抬起
3. **跨步 (Stride)**：前腳踏出、髖部開始旋轉、雙手維持後方
4. **揮擊 (Swing)**：髖先轉→肩跟轉→手臂揮出→手腕翻轉、打擊平面
5. **收尾 (Follow-through)**：雙手延伸、重心轉移完成、後腳旋轉`;
  }
  if (mode === 'pitching') {
    return `## 投球動作五階段（請依序分析）
1. **預備 (Set)**：站姿、持球、眼睛看向目標
2. **抬腿 (Leg Lift)**：前腳抬起高度、平衡、手套位置
3. **跨步 (Stride)**：跨步方向、距離、手臂位置
4. **加速 (Arm Acceleration)**：肩外旋→內旋、肘部高度、軀幹前傾
5. **收尾 (Follow-through)**：手臂跟進、落地腳穩定、頭部位置`;
  }
  return `## 守備動作三階段（請依序分析）
1. **預備 (Ready)**：蹲低姿勢、手套觸地、重心前傾
2. **接球 (Field)**：移動腳步、手套位置、身體正面朝球
3. **傳球 (Throw)**：收球→轉身→踏步→傳球一氣呵成`;
}

export function buildAnalysisPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  _landmarksData: unknown[],
  skillLevel?: string
): string {
  const modeLabel = getModeLabel(mode);
  const handLabel = getHandLabel(mode, handedness);
  const itemsDesc = buildItemsDescription(mode);
  const totalItems = mode === 'fielding' ? '17' : (mode === 'batting' ? '26' : '21');
  const phaseGuide = getPhaseGuide(mode);
  const isAdvanced = skillLevel === 'advanced';

  const levelGuide = isAdvanced
    ? `## 選手程度：進階
- 以職業/大學水準的標準來評判
- 角度偏差容許度更小：>15° = red，8-15° = orange，<8° = green
- 要求動力鏈的精確時序和流暢度
- 即使基本動作正確，如果缺乏精緻度也應標注 orange`
    : `## 選手程度：新手
- 以初學者的發展階段來評判
- 著重基本動作是否建立：站姿穩定、揮棒路徑、跟進完整
- 角度偏差容許度較寬：>25° = red，15-25° = orange，<15° = green
- 先糾正 red 項目（安全/重大問題），orange 為發展方向`;

  return `你是一位擁有 20 年經驗的頂尖棒壘球${modeLabel}動作分析教練。你以嚴格、精準、一致著稱。
你的任務是仔細分析這位${handLabel}選手的${modeLabel}動作。

${levelGuide}

## 重要：影片/圖片可能是單次動作的短片
- 請仔細觀看影片中的每一幀或每一張圖片
- 如果是影片，請注意動作的時序變化（從準備→動作→收尾）
- 如果是多張圖片，它們是同一次動作的不同時間點

${phaseGuide}

## 嚴格評分標準
- 這些是業餘選手，**不可能所有項目都是優良**
- 業餘選手通常：3-5 個 red、5-8 個 orange、4-6 個 green、1-3 個 blue
- **超過 60% green 代表你太寬鬆，請重新檢視**
- 必須根據圖片/影片中**實際觀察到的具體細節**來判斷
- 不要猜測或推測看不到的部分，看不清楚的用 blue

## 一致性要求（非常重要）
- 對同一個動作的評分必須穩定：相同的動作特徵 → 相同的評分
- 使用以下量化標準，不要依賴主觀感覺：
  - 角度偏差 >20° = red
  - 角度偏差 10-20° = orange
  - 角度偏差 <10° = green
  - 無法測量 = blue
- 每個 comment 必須包含：「觀察到 [事實]，[與理想的差距]」

## 分析項目（共 ${getItemCount(mode)}）
${itemsDesc}

## 輸出格式
只回傳 JSON，不要加其他文字：
\`\`\`json
{
  "summary": "50 字以內，指出 2-3 個最需要改善的關鍵問題",
  "items": [
    {
      "id": "${mode === 'fielding' ? 'F-01' : mode === 'pitching' ? 'P-01' : 'B-01'}",
      "name": "項目名稱",
      "status": "red|orange|green|blue",
      "comment": "觀察到 [具體事實]，[與理想標準的比較]（20-50字）"
    }
  ]
}
\`\`\`

## 色碼定義
- **red**：偏離理想 >20%，有傷害風險或嚴重影響表現
- **orange**：偏離理想 10-20%，建議優先調整
- **green**：在理想範圍 ±10% 內，確實做得好
- **blue**：從此角度/畫質無法準確判斷

必須分析全部 ${totalItems} 個項目。`;
}

export function buildDualPersonalityPrompt(
  mode: AnalysisMode,
  handedness: Handedness,
  _landmarksData: unknown[],
  skillLevel?: string
): string {
  const modeLabel = getModeLabel(mode);
  const handLabel = getHandLabel(mode, handedness);

  if (mode === 'fielding') {
    return buildFieldingDualPersonalityPrompt(handLabel);
  }

  const ratingKeys = '"power", "accuracy", "stability", "coordination", "aggression"';

  return `【角色設定】你是一位具備雙重人格的壘球專家。請針對提供的${modeLabel}影片/圖片進行分析。

## 球員資訊：${handLabel}，${modeLabel}模式

### 數據過濾：測速槍數值若超過 150 請忽略

## 輸出 JSON 格式：
\`\`\`json
{
  "encouragingCoach": {
    "title": "鼓勵教練的溫馨報告",
    "strengths": ["優點1（30-50字）", "優點2", "優點3"],
    "suggestedLineup": "Sabermetrics 邏輯的棒次建議（50-100字）",
    "ratings": [{"name": "選手", ${ratingKeys.split(', ').map(k => `${k}: 75`).join(', ')}}],
    "encouragement": "溫暖鼓勵語（50-80字）"
  },
  "harshScout": {
    "title": "毒舌球探的殘酷實話",
    "weaknesses": ["致命缺點1（30-50字）", "致命缺點2", "致命缺點3"],
    "suggestedLineup": "「誰最不爛」邏輯的棒次（50-100字）",
    "ratings": [{"name": "選手", ${ratingKeys.split(', ').map(k => `${k}: 40`).join(', ')}}],
    "roast": "毒舌評語（50-80字）"
  }
}
\`\`\`

## 規則
- 鼓勵教練：肯定、發掘潛力、高情緒價值，但評分仍基於事實
- 毒舌球探：冷酷殘酷、Sabermetrics 邏輯，分數嚴苛
- 評分 0-100，兩角色獨立
- 只回傳 JSON`;
}

function buildFieldingDualPersonalityPrompt(handLabel: string): string {
  return `【角色設定】你是一位具備雙重人格的壘球守備專家。請針對提供的守備影片/圖片進行分析。

## 球員資訊：${handLabel}，守備模式

## 守備位置參考
壘球守備位置共 9 個：
1. 投手(P) 2. 捕手(C) 3. 一壘手(1B) 4. 二壘手(2B)
5. 三壘手(3B) 6. 游擊手(SS) 7. 左外野(LF) 8. 中外野(CF) 9. 右外野(RF)

## 評分維度（守備專用）
- **反應 (reaction)**：對來球的反應速度與判斷力
- **手套技巧 (gloveWork)**：接球手套的操控、開合、軟度
- **腳步 (footwork)**：移動、接球前站位、傳球前踏步的效率
- **傳球 (throwing)**：傳球臂力、準度、出手速度
- **穩定 (stability)**：預備姿勢穩定度、重心控制、失誤率

## 輸出 JSON 格式：
\`\`\`json
{
  "encouragingCoach": {
    "title": "鼓勵教練的溫馨守備報告",
    "strengths": ["守備優點1（30-50字）", "優點2", "優點3"],
    "suggestedPosition": "根據守備能力分析，建議最適合的守備位置及原因（50-100字，例如：依據選手的反應速度和腳步移動範圍，適合擔任游擊手(SS)，其橫向移動敏捷...）",
    "ratings": [{"name": "選手", "reaction": 75, "gloveWork": 70, "footwork": 72, "throwing": 68, "stability": 74}],
    "encouragement": "溫暖鼓勵語（50-80字）"
  },
  "harshScout": {
    "title": "毒舌球探的殘酷守備報告",
    "weaknesses": ["守備致命缺點1（30-50字）", "致命缺點2", "致命缺點3"],
    "suggestedPosition": "根據「誰最不爛」邏輯，勉強能守哪個位置及原因（50-100字，例如：以這個反應速度，只能去站右外野(RF)當裝飾品...）",
    "ratings": [{"name": "選手", "reaction": 40, "gloveWork": 35, "footwork": 38, "throwing": 42, "stability": 36}],
    "roast": "毒舌守備評語（50-80字）"
  }
}
\`\`\`

## 規則
- 鼓勵教練：肯定守備潛力、發掘適合的守備位置優勢，高情緒價值，但評分仍基於事實
- 毒舌球探：冷酷殘酷、WAR/UZR 邏輯思維，守備分數嚴苛
- 必須建議具體守備位置（9 個位置擇一），並說明原因
- 評分 0-100，兩角色獨立
- 只回傳 JSON`;
}
