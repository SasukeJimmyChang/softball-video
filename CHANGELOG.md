# 更新紀錄 (Changelog)

本檔案記錄專案每次更新的時間、功能變更與使用的技術。

---

## [v0.3.1] — 2026-04-07

### 修復：Gemini API 429 Quota Exceeded 錯誤

**問題描述**：`gemini-2.0-flash` 免費額度為 0 或已耗盡，API 回傳 429 Too Many Requests。

**修復內容**：
- 新增 model fallback 機制：`gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-1.5-flash-latest`
- 遇到 429 自動等待 5-10 秒後重試（每個 model 最多重試 2 次）
- 所有 API 錯誤訊息中文化，不再顯示原始 JSON 錯誤
- 額度用完時顯示友善提示（建議等 1 分鐘或確認 API Key）

### 異動檔案
| 檔案 | 變更 |
|------|------|
| `src/lib/gemini.ts` | model fallback、retry、錯誤中文化 |

---

## [v0.3.0] — 2026-04-07

### 修復：手機分析卡住問題

**問題描述**：手機 Chrome 上點「開始分析」後卡在「骨架偵測中...」，Gemini API 從未被呼叫。

**根本原因**：
1. MediaPipe `pose_landmarker_heavy` 模型 ~30MB，手機下載太慢
2. MediaPipe GPU delegate 在部分手機瀏覽器上初始化失敗，無錯誤回報
3. `video.onseeked` 事件在手機瀏覽器上不可靠，可能永遠不觸發導致 Promise 卡死
4. 50 幀擷取量在手機上太多

**修復內容**：
- 模型改用 `pose_landmarker_lite`（~5MB，手機載入快 6 倍）
- GPU 初始化失敗自動 fallback 到 CPU delegate
- video seek 改用 timeout + polling fallback（3 秒內未 seeked 自動跳過）
- 最大幀數從 50 降到 30，自適應間隔分配
- 連續失敗超過 5/10 次自動中止，不再卡死
- 模型載入加 60 秒 timeout，影片 metadata 加 15 秒 timeout
- 每幀 seek 後加 50ms 延遲讓影格正確渲染

### 修復：按鈕顯示 `&#9203;` 原始碼
- JSX 中 `{}` 表達式裡的 HTML entity 不會被渲染
- 改用 Unicode escape：`\u23F3`（沙漏）、`\u25B6`（播放）

### 新增：Vercel 執行時間設定
- API route 加入 `export const maxDuration = 60`（Vercel Pro 支援 60 秒）
- 改善 Gemini 回應 JSON 解析容錯

### 異動檔案
| 檔案 | 變更 |
|------|------|
| `src/lib/pose-detection.ts` | 模型改 lite、GPU→CPU fallback、seek timeout、自適應幀數 |
| `src/components/AnalysisSettings.tsx` | 修復 HTML entity 渲染 |
| `src/app/page.tsx` | 加入初始化 timeout、改善狀態提示、降低最大幀數 |
| `src/app/api/analyze/route.ts` | 加 maxDuration、改善 JSON 解析 |

---

## [v0.2.1] — 2026-04-07

### 文件新增
- **PROJECT.md** — 新增 Vercel 部署指南（步驟、環境變數設定、免費方案限制）
- **CHANGELOG.md** — 本檔案建立，記錄 v0.1.0 ~ v0.2.1 所有更新

### 異動檔案
| 檔案 | 變更 |
|------|------|
| `PROJECT.md` | 新增 Vercel 部署指南章節 |
| `CHANGELOG.md` | 新增 v0.2.1 紀錄 |

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
