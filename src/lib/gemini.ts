import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('尚未設定 GEMINI_API_KEY 環境變數');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface GeminiAnalysisRequest {
  prompt: string;
  video: string; // base64 data URL of video
  mimeType: string;
}

// Models to try in order of preference (April 2026)
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

function buildParts(request: GeminiAnalysisRequest): any[] {
  const parts: any[] = [];

  // Add video inline data
  const base64Match = request.video.match(/^data:(.*?);base64,(.*)$/);
  if (base64Match) {
    parts.push({
      inlineData: {
        mimeType: base64Match[1] || request.mimeType,
        data: base64Match[2],
      },
    });
  }

  // Add text prompt
  parts.push({ text: request.prompt });

  return parts;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeWithGemini(request: GeminiAnalysisRequest): Promise<string> {
  const client = getClient();
  const parts = buildParts(request);

  let lastError: any = null;

  for (const modelName of MODEL_CANDIDATES) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        const response = result.response;
        const text = response.text();
        if (text) {
          console.log(`Gemini analysis succeeded with model: ${modelName}`);
          return text;
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message || '';

        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
          console.warn(`Model ${modelName} rate limited (attempt ${attempt + 1}), waiting...`);
          await sleep(attempt === 0 ? 5000 : 10000);
          continue;
        }

        if (errorMsg.includes('503') || errorMsg.includes('Service Unavailable') || errorMsg.includes('overloaded')) {
          console.warn(`Model ${modelName} unavailable (attempt ${attempt + 1}), waiting...`);
          await sleep(attempt === 0 ? 3000 : 8000);
          continue;
        }

        if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
          console.warn(`Model ${modelName} not available, trying next...`);
          break;
        }

        console.warn(`Model ${modelName} error: ${errorMsg.slice(0, 100)}, trying next...`);
        break;
      }
    }
  }

  throw formatError(lastError);
}

function formatError(error: any): Error {
  const msg = error?.message || String(error);

  if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded')) {
    return new Error('Gemini API 伺服器暫時忙碌中。這是 Google 端的問題，請等 1-2 分鐘後重試。');
  }

  if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
    return new Error('Gemini API 額度暫時用完。請等 1 分鐘後再試。');
  }

  if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
    return new Error('API Key 無效或未授權。請確認 GEMINI_API_KEY 環境變數設定正確。');
  }

  if (msg.includes('fetch failed') || msg.includes('network')) {
    return new Error('無法連線到 Gemini API。請檢查網路連線。');
  }

  if (msg.includes('too large') || msg.includes('size') || msg.includes('payload')) {
    return new Error('影片檔案太大。請壓縮影片或裁剪長度後重試。');
  }

  return new Error(`AI 分析失敗：${msg.slice(0, 200)}`);
}
