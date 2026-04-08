import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { buildAnalysisPrompt, buildDualPersonalityPrompt } from '@/lib/prompts';
import { AnalysisMode, Handedness, AnalysisResultItem, DualPersonalityReport } from '@/types';

export const maxDuration = 60;

function parseJsonFromResponse(text: string): any {
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();
  const objectMatch = jsonStr.match(/(\{[\s\S]*\})/);
  if (objectMatch) jsonStr = objectMatch[1];
  return JSON.parse(jsonStr);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, handedness, images, dualPersonality: dpOnly }:
      { mode: AnalysisMode; handedness: Handedness; images: string[]; dualPersonality?: boolean } = body;

    if (!mode || !handedness || !images || images.length === 0) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // If dualPersonality flag is set, ONLY do dual personality analysis
    if (dpOnly) {
      const dpPrompt = buildDualPersonalityPrompt(mode, handedness, []);
      const dpText = await analyzeWithGemini({ prompt: dpPrompt, images });
      const dpParsed = parseJsonFromResponse(dpText);

      const dp: DualPersonalityReport = {
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
          ...(dpParsed.encouragingCoach?.encouragement ? { encouragement: dpParsed.encouragingCoach.encouragement } : {}),
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
          ...(dpParsed.harshScout?.roast ? { roast: dpParsed.harshScout.roast } : {}),
        },
      };

      return NextResponse.json({ dualPersonality: dp });
    }

    // Standard analysis only
    const prompt = buildAnalysisPrompt(mode, handedness, []);
    const responseText = await analyzeWithGemini({ prompt, images });
    const parsed = parseJsonFromResponse(responseText);

    return NextResponse.json({
      summary: parsed.summary || '',
      items: (parsed.items || []).map((item: any) => ({
        id: item.id, name: item.name, status: item.status, comment: item.comment,
      })),
    });
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
