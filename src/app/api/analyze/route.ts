import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { buildAnalysisPrompt } from '@/lib/prompts';
import { AnalysisMode, Handedness, AnalysisResultItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode,
      handedness,
      frames,
      images,
    }: {
      mode: AnalysisMode;
      handedness: Handedness;
      frames: Array<{
        timestamp: number;
        landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
      }>;
      images: string[];
    } = body;

    if (!mode || !handedness || !frames || !images) {
      return NextResponse.json(
        { error: 'Missing required fields: mode, handedness, frames, images' },
        { status: 400 }
      );
    }

    const prompt = buildAnalysisPrompt(mode, handedness, frames);

    const responseText = await analyzeWithGemini({
      prompt,
      images,
    });

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    const result: { summary: string; items: AnalysisResultItem[] } = {
      summary: parsed.summary || '',
      items: (parsed.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        comment: item.comment,
      })),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
