import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { buildAnalysisPrompt, buildDualPersonalityPrompt } from '@/lib/prompts';
import { AnalysisMode, Handedness, AnalysisResultItem, DualPersonalityReport } from '@/types';

// Allow up to 60s for Vercel Pro, 10s for Hobby
export const maxDuration = 60;

function parseJsonFromResponse(text: string): any {
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  const objectMatch = jsonStr.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    jsonStr = objectMatch[1];
  }
  return JSON.parse(jsonStr);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode,
      handedness,
      video,
      mimeType,
      dualPersonality: enableDualPersonality,
    }: {
      mode: AnalysisMode;
      handedness: Handedness;
      video: string; // base64 data URL of video
      mimeType: string;
      dualPersonality?: boolean;
    } = body;

    if (!mode || !handedness || !video) {
      return NextResponse.json(
        { error: '缺少必要欄位：mode, handedness, video' },
        { status: 400 }
      );
    }

    // Build prompt (no landmarks — Gemini analyzes video directly)
    const prompt = buildAnalysisPrompt(mode, handedness, []);

    // Standard analysis — send video directly to Gemini
    const responseText = await analyzeWithGemini({
      prompt,
      video,
      mimeType: mimeType || 'video/mp4',
    });
    const parsed = parseJsonFromResponse(responseText);

    const result: {
      summary: string;
      items: AnalysisResultItem[];
      dualPersonality?: DualPersonalityReport;
    } = {
      summary: parsed.summary || '',
      items: (parsed.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        comment: item.comment,
      })),
    };

    // Dual personality analysis (separate API call)
    if (enableDualPersonality) {
      const dpPrompt = buildDualPersonalityPrompt(mode, handedness, []);
      const dpResponseText = await analyzeWithGemini({
        prompt: dpPrompt,
        video,
        mimeType: mimeType || 'video/mp4',
      });
      const dpParsed = parseJsonFromResponse(dpResponseText);

      result.dualPersonality = {
        encouragingCoach: {
          strengths: dpParsed.encouragingCoach?.strengths || [],
          suggestedLineup: dpParsed.encouragingCoach?.suggestedLineup || '',
          ratings: (dpParsed.encouragingCoach?.ratings || []).map((r: any) => ({
            name: r.name || '選手',
            power: r.power ?? r.reaction ?? 0,
            accuracy: r.accuracy ?? r.gloveWork ?? 0,
            stability: r.stability ?? 0,
            coordination: r.coordination ?? r.throwing ?? 0,
            aggression: r.aggression ?? r.footwork ?? 0,
          })),
          ...( dpParsed.encouragingCoach?.encouragement
            ? { encouragement: dpParsed.encouragingCoach.encouragement }
            : {}),
        },
        harshScout: {
          weaknesses: dpParsed.harshScout?.weaknesses || [],
          suggestedLineup: dpParsed.harshScout?.suggestedLineup || '',
          ratings: (dpParsed.harshScout?.ratings || []).map((r: any) => ({
            name: r.name || '選手',
            power: r.power ?? r.reaction ?? 0,
            accuracy: r.accuracy ?? r.gloveWork ?? 0,
            stability: r.stability ?? 0,
            coordination: r.coordination ?? r.throwing ?? 0,
            aggression: r.aggression ?? r.footwork ?? 0,
          })),
          ...( dpParsed.harshScout?.roast
            ? { roast: dpParsed.harshScout.roast }
            : {}),
        },
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
