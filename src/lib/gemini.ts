import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('尚未設定 GEMINI_API_KEY 環境變數');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface GeminiAnalysisRequest {
  prompt: string;
  images: string[]; // base64 data URLs of frame images
}

const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

function buildParts(request: GeminiAnalysisRequest): any[] {
  const parts: any[] = [];
  for (const dataUrl of request.images) {
    const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }
  parts.push({ text: request.prompt });
  return parts;
}

async function sleep(ms: number) {
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
        const text = result.response.text();
        if (text) {
          console.log(`Gemini succeeded: ${modelName}`);
          return text;
        }
      } catch (error: any) {
        lastError = error;
        const msg = error?.message || '';

        if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many')) {
          console.warn(`${modelName} rate limited (${attempt + 1}/3)`);
          await sleep(5000 + attempt * 5000);
          continue;
        }
        if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('overloaded')) {
          console.warn(`${modelName} unavailable (${attempt + 1}/3)`);
          await sleep(3000 + attempt * 5000);
          continue;
        }
        if (msg.includes('404') || msg.includes('not found')) {
          console.warn(`${modelName} not found, next...`);
          break;
        }
        console.warn(`${modelName} error: ${msg.slice(0, 80)}, next...`);
        break;
      }
    }
  }

  throw formatError(lastError);
}

function formatError(error: any): Error {
  const msg = error?.message || String(error);
  if (msg.includes('503') || msg.includes('Service Unavailable'))
    return new Error('Gemini API 伺服器暫時忙碌中，請等 1-2 分鐘後重試。');
  if (msg.includes('429') || msg.includes('quota'))
    return new Error('Gemini API 額度暫時用完，請等 1 分鐘後再試。');
  if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY'))
    return new Error('API Key 無效或未授權。');
  if (msg.includes('too large') || msg.includes('payload'))
    return new Error('資料太大，請使用較短的影片。');
  return new Error(`AI 分析失敗：${msg.slice(0, 150)}`);
}
