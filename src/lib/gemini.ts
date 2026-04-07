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
  images: string[]; // base64 data URLs
}

// Models to try in order of preference (April 2026: 2.0/1.5 deprecated)
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

function buildParts(request: GeminiAnalysisRequest): any[] {
  const parts: any[] = [{ text: request.prompt }];
  for (const imageDataUrl of request.images) {
    const base64Match = imageDataUrl.match(/^data:image\/(.*?);base64,(.*)$/);
    if (base64Match) {
      parts.push({
        inlineData: {
          mimeType: `image/${base64Match[1]}`,
          data: base64Match[2],
        },
      });
    }
  }
  return parts;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeWithGemini(request: GeminiAnalysisRequest): Promise<string> {
  const client = getClient();
  const parts = buildParts(request);

  let lastError: any = null;

  // Try each model candidate
  for (const modelName of MODEL_CANDIDATES) {
    // Retry up to 2 times per model (with delay for rate limits)
    for (let attempt = 0; attempt < 2; attempt++) {
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

        // If quota exceeded / rate limited, wait and retry
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('Too Many Requests')) {
          console.warn(`Model ${modelName} rate limited (attempt ${attempt + 1}), waiting...`);
          await sleep(attempt === 0 ? 5000 : 10000);
          continue;
        }

        // If model not found or not available, try next model
        if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
          console.warn(`Model ${modelName} not available, trying next...`);
          break;
        }

        // Other errors: throw immediately
        throw formatError(error);
      }
    }
  }

  // All models failed
  throw formatError(lastError);
}

function formatError(error: any): Error {
  const msg = error?.message || String(error);

  if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
    return new Error(
      'Gemini API 免費額度已用完。請稍後再試（建議等 1 分鐘），' +
      '或到 Google AI Studio 確認額度狀態：https://aistudio.google.com/apikey'
    );
  }

  if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
    return new Error('API Key 無效或未授權。請確認 GEMINI_API_KEY 環境變數設定正確。');
  }

  if (msg.includes('fetch failed') || msg.includes('network')) {
    return new Error('無法連線到 Gemini API。請檢查網路連線。');
  }

  return new Error(`AI 分析失敗：${msg.slice(0, 200)}`);
}
