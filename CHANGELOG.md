# 更新紀錄 (Changelog)

本檔案記錄專案每次更新的時間、功能變更與使用的技術。

---

## [v0.2.0] — 2026-04-07

### 新增功能
- **守備分析模式（滾地球）**
  - 新增 14 項靜態分析指標 (F-01 ~ F-14)：預備姿勢、手套位置、接球手肘角度、站距、膝蓋彎曲度、臀部高度、頭部穩定、裸手位置、正面朝球、收球動作、傳球手臂角度、跨步傳球方向、重心轉移、腳步移動效率
  - 新增 3 項時序分析指標 (FT-01 ~ FT-03)：反應起動速度、接傳球轉換速度、腳步節奏連貫性
  - 分析設定面板新增「守備分析（滾地球）」按鈕

- **雙人格教練分析（可選功能）**
  - 設定面板新增「雙人格教練分析」checkbox
  - 鼓勵教練報告：球員優點分析、教練版建議棒次（Sabermetrics 邏輯）、能力評分表（爆/準/穩/協/積極）、溫馨鼓勵語
  - 毒舌球探報告：致命缺點分析、球探版建議棒次（「誰最不爛」邏輯）、嚴苛評分表、毒舌總評
  - 報告 UI 以綠色（鼓勵教練）和紅色（毒舌球探）區塊呈現
  - 能力評分以進度條視覺化呈現

### 技術變更
- 新增型別：`AnalysisOptions`, `DualPersonalityReport`, `PlayerRating`
- `AnalysisMode` 新增 `'fielding'` 選項
- `prompts.ts` 新增 `buildDualPersonalityPrompt()` 函式
- `analysis-items.ts` 新增 `fieldingItems` 陣列
- API route 支援 `dualPersonality` 參數，啟用時會額外呼叫一次 Gemini API

### 異動檔案
| 檔案 | 變更 |
|------|------|
| `src/types/index.ts` | 新增 fielding mode、雙人格報告型別 |
| `src/lib/analysis-items.ts` | 新增守備分析指標 |
| `src/lib/prompts.ts` | 新增守備 prompt + 雙人格 prompt |
| `src/components/AnalysisSettings.tsx` | 新增守備按鈕 + 雙人格 checkbox |
| `src/components/AnalysisReport.tsx` | 新增雙人格報告 UI |
| `src/app/api/analyze/route.ts` | 支援守備模式 + 雙人格分析 API |
| `src/app/page.tsx` | 串接新選項到所有元件 |

---

## [v0.1.0] — 2026-04-07

### 初始功能
- **投球分析**
  - 18 項靜態分析 (P-01 ~ P-18) + 3 項時序分析 (T-01 ~ T-03)
  - 慣用手選擇（右投 / 左投）

- **打擊分析**
  - 18 項靜態分析 (B-01 ~ B-18) + 3 項時序分析 (T-04 ~ T-06)
  - 慣用手選擇（右打 / 左打）

- **骨架偵測**
  - MediaPipe PoseLandmarker（瀏覽器端即時偵測）
  - 33 個人體關節點
  - Canvas 骨架覆蓋顯示
  - 每 0.1 秒擷取一幀

- **AI 姿勢分析**
  - Google Gemini 2.0 Flash Vision API
  - 選取 6 張關鍵幀送入分析
  - 結構化 JSON 回應解析

- **色碼報告系統**
  - 紅（需改進）/ 橙（需注意）/ 綠（優良）/ 藍（提示）
  - 卡片式報告呈現

- **前端 UI**
  - 深色主題（類似原站風格）
  - 響應式設計（桌面三欄 / 手機單欄）
  - 狀態列即時回饋
  - 影片上傳 + 播放器

### 技術堆疊
| 技術 | 用途 |
|------|------|
| Next.js 16 (App Router) | 前端框架 + API Routes |
| TypeScript | 型別安全 |
| TailwindCSS 4 | UI 樣式 |
| MediaPipe PoseLandmarker | 瀏覽器端骨架偵測 |
| Google Gemini 2.0 Flash | AI Vision 分析 |
| `@google/generative-ai` | Gemini API SDK |
| `@mediapipe/tasks-vision` | MediaPipe JS SDK |

### 異動檔案
| 檔案 | 說明 |
|------|------|
| `src/app/page.tsx` | 主頁面 |
| `src/app/layout.tsx` | HTML Layout |
| `src/app/globals.css` | 全域樣式 |
| `src/app/api/analyze/route.ts` | Gemini API 端點 |
| `src/components/AnalysisSettings.tsx` | 設定面板 |
| `src/components/VideoPlayer.tsx` | 影片播放器 + 骨架 |
| `src/components/AnalysisReport.tsx` | 分析報告 |
| `src/lib/pose-detection.ts` | MediaPipe 封裝 |
| `src/lib/gemini.ts` | Gemini API client |
| `src/lib/prompts.ts` | 分析 prompt 模板 |
| `src/lib/analysis-items.ts` | 分析指標定義 |
| `src/types/index.ts` | 型別定義 |
