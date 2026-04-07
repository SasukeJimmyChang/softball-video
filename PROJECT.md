# 專案總覽 — AI 智慧教練（棒壘球姿勢分析）

## 簡介

復刻 `ball.jbstudio.top/ai/`（J&B 野球魂 AI 智慧教練）的核心功能。  
使用者上傳投球、打擊或守備影片，系統自動進行骨架偵測 + AI 姿勢分析，產出結構化的動作診斷報告。

---

## 技術架構

| 層級 | 技術 | 說明 |
|------|------|------|
| **前端框架** | Next.js 16 (App Router) | React 伺服端渲染 + 客戶端互動 |
| **語言** | TypeScript | 全專案型別安全 |
| **樣式** | TailwindCSS 4 | Utility-first CSS |
| **骨架偵測** | MediaPipe PoseLandmarker | 瀏覽器端即時偵測 33 個人體關節點（免費） |
| **AI 分析** | Google Gemini 2.0 Flash API | Vision 多模態分析（圖片 + 文字） |
| **API 層** | Next.js API Routes | `/api/analyze` 處理 Gemini API 呼叫 |
| **套件管理** | npm | Node.js 套件管理 |

### 關鍵依賴

| 套件 | 版本 | 用途 |
|------|------|------|
| `next` | 16.x | 前端框架 |
| `react` | 19.x | UI 函式庫 |
| `@mediapipe/tasks-vision` | latest | MediaPipe Pose 骨架偵測（瀏覽器端） |
| `@google/generative-ai` | latest | Google Gemini API SDK |
| `tailwindcss` | 4.x | CSS 框架 |

---

## 功能列表

### 1. 投球分析（Pitching）
- **18 項靜態分析** (P-01 ~ P-18)：掉手肘、抬腿高度、投球肘角度、肩線傾斜、手套臂收回、放球腕位、跨步踏點方向、跨步距離、支撐腳膝蓋、收尾動作、頭部穩定、髖肩分離、軀幹前傾角、上臂出手角度、骨盆旋轉量化、踏步腳落地穩定、頸部側傾、支撐腳膝外翻
- **3 項時序分析** (T-01 ~ T-03)：手腕加速時機、肩旋轉爆發力、重心前移量

### 2. 打擊分析（Batting）
- **18 項靜態分析** (B-01 ~ B-18)：重心前衝、倒棒、後手肘（雞翅）、前手肘角度、雙腳站距、前膝角度、後膝蹬地、肩線傾斜、頭部穩定、髖部旋轉、前手引導、跟進完整度、打擊踏步距離、備棒高度（Load）、脊椎側傾角、前手延伸、頸部傾斜、後腳膝關節追蹤
- **3 項時序分析** (T-04 ~ T-06)：揮棒加速時機、肩部旋轉速度、後腳跟離地

### 3. 守備分析（Fielding — 滾地球）
- **14 項靜態分析** (F-01 ~ F-14)：預備姿勢、手套位置、接球手肘角度、雙腳站距、膝蓋彎曲度、臀部高度、頭部穩定、裸手位置、身體正面朝球、接球後收球動作、傳球手臂角度、跨步傳球方向、重心轉移、腳步移動效率
- **3 項時序分析** (FT-01 ~ FT-03)：反應起動速度、接傳球轉換速度、腳步節奏連貫性

### 4. 雙人格教練分析（可選功能）
勾選後會額外產生兩份報告：

| 角色 | 風格 | 內容 |
|------|------|------|
| **鼓勵教練** | 溫馨、肯定潛力、高情緒價值 | 優點分析 + 建議棒次（Sabermetrics） + 能力評分（爆/準/穩/協/積極） |
| **毒舌球探** | 冷酷、殘酷、拒絕虛偽 | 致命缺點 + 建議棒次（誰最不爛） + 嚴苛評分 |

### 5. 色碼報告系統
| 色碼 | 含義 |
|------|------|
| 🔴 紅色 | 需改進 — 明顯偏離理想，有受傷風險 |
| 🟠 橙色 | 需注意 — 略微偏離，建議調整 |
| 🟢 綠色 | 優良 — 在理想範圍內 |
| 🔵 藍色 | 提示 — 參考性建議 |

---

## 專案結構

```
softball-video/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # 主頁面（狀態管理 + 元件整合）
│   │   ├── layout.tsx                # HTML Layout
│   │   ├── globals.css               # TailwindCSS 全域樣式
│   │   └── api/analyze/route.ts      # Gemini API 端點
│   ├── components/
│   │   ├── AnalysisSettings.tsx      # 設定面板（模式/慣用手/選項/上傳）
│   │   ├── VideoPlayer.tsx           # 影片播放器 + Canvas 骨架覆蓋
│   │   └── AnalysisReport.tsx        # 分析報告（色碼卡片 + 雙人格報告）
│   ├── lib/
│   │   ├── pose-detection.ts         # MediaPipe PoseLandmarker 封裝
│   │   ├── gemini.ts                 # Gemini API client
│   │   ├── prompts.ts                # 所有分析 prompt 模板
│   │   └── analysis-items.ts         # 投球/打擊/守備分析指標定義
│   └── types/
│       └── index.ts                  # TypeScript 型別定義
├── .env.local                        # GEMINI_API_KEY（不進 git）
├── package.json
├── next.config.ts
├── tsconfig.json
├── CHANGELOG.md                      # 更新紀錄
└── PROJECT.md                        # 本檔案
```

---

## 使用方式

### 環境需求
- Node.js 18+
- Google AI Studio API Key（[取得](https://aistudio.google.com/apikey)）

### 安裝與啟動
```bash
npm install
# 編輯 .env.local，填入你的 GEMINI_API_KEY
npm run dev
```

### 操作流程
1. 選擇分析模式（投球 / 打擊 / 守備）
2. 選擇慣用手
3. （可選）勾選「雙人格教練分析」
4. 上傳影片
5. 點擊「開始分析」
6. 等待骨架偵測 → AI 分析 → 查看報告

---

## 分析流程技術細節

```
上傳影片
  ↓
MediaPipe PoseLandmarker（瀏覽器端）
  → 每 0.1 秒擷取一幀
  → 偵測 33 個人體關節點
  → Canvas 繪製骨架覆蓋
  ↓
選取 6 張關鍵幀（均勻分佈）
  ↓
POST /api/analyze
  → 送出：關鍵幀圖片(base64) + 骨架座標 + 分析模式
  → 呼叫 Gemini 2.0 Flash Vision API
  → 解析 JSON 回應
  ↓
渲染報告
  → 色碼卡片（紅/橙/綠/藍）
  → 雙人格報告（如有勾選）
```

---

## 部署指南（Vercel）

### 步驟一：推送到 GitHub
確保你的程式碼已推送到 GitHub 上的 repository。

### 步驟二：Vercel 連結
1. 前往 [vercel.com](https://vercel.com/) 並用 GitHub 帳號登入
2. 點擊 **「Add New... → Project」**
3. 選擇你的 `softball-video` repository
4. Framework Preset 會自動偵測為 **Next.js**（不用改）

### 步驟三：設定環境變數
在 Vercel 的部署設定頁面，找到 **「Environment Variables」** 區塊，新增：

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | 你的 Google AI Studio API Key |

> **重要**：不要把 API Key 寫在程式碼裡或 commit 到 git。永遠透過環境變數設定。

### 步驟四：部署
點擊 **「Deploy」**，Vercel 會自動：
1. 安裝依賴 (`npm install`)
2. 建構專案 (`next build`)
3. 部署到 `https://your-project.vercel.app`

### 後續更新
之後只要 `git push` 到 GitHub，Vercel 就會自動重新部署（CI/CD 內建）。

### 自訂網域（可選）
在 Vercel Dashboard → 你的專案 → Settings → Domains，可以綁定自己的網域。

### Vercel 免費方案限制
| 項目 | 限制 |
|------|------|
| 頻寬 | 100 GB/月 |
| Serverless 執行時間 | 10 秒（Hobby）/ 60 秒（Pro） |
| 部署次數 | 無限制 |
| 費用 | Hobby 方案免費 |

> **注意**：Gemini API 分析可能需要數秒，如果影片較長且分析項目多，Hobby 方案的 10 秒限制可能不夠。可考慮升級 Vercel Pro ($20/月) 或改用 Streaming Response。
