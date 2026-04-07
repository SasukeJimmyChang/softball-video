import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface GeminiAnalysisRequest {
  prompt: string;
  images: string[]; // base64 data URLs
}

export async function analyzeWithGemini(request: GeminiAnalysisRequest): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build parts: text prompt + images
  const parts: any[] = [{ text: request.prompt }];

  for (const imageDataUrl of request.images) {
    // Extract base64 data from data URL
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

  const result = await model.generateContent(parts);
  const response = result.response;
  return response.text();
}
