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
    const { mode, handedness, images, dualPersonality: enableDualPersonality }:
      { mode: AnalysisMode; handedness: Handedness; images: string[]; dualPersonality?: boolean } = body;

    if (!mode || !handedness || !images || images.length === 0) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // Run both analyses in PARALLEL to stay within Vercel timeout
    const standardPrompt = buildAnalysisPrompt(mode, handedness, []);
    const standardCall = analyzeWithGemini({ prompt: standardPrompt, images });

    let dpCall: Promise<string> | null = null;
    if (enableDualPersonality) {
      const dpPrompt = buildDualPersonalityPrompt(mode, handedness, []);
      dpCall = analyzeWithGemini({ prompt: dpPrompt, images });
    }

    // Await both simultaneously
    const [standardText, dpText] = await Promise.all([
      standardCall,
      dpCall ?? Promise.resolve(null),
    ]);

    // Parse standard analysis
    const parsed = parseJsonFromResponse(standardText);
    const result: { summary: string; items: AnalysisResultItem[]; dualPersonality?: DualPersonalityReport } = {
      summary: parsed.summary || '',
      items: (parsed.items || []).map((item: any) => ({
        id: item.id, name: item.name, status: item.status, comment: item.comment,
      })),
    };

    // Parse dual personality (if enabled)
    if (dpText) {
      const dpParsed = parseJsonFromResponse(dpText);
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
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
