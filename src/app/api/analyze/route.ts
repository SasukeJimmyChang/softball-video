import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithGemini } from '@/lib/gemini';
import { buildAnalysisPrompt, buildDualPersonalityPrompt } from '@/lib/prompts';
import { AnalysisMode, Handedness, SkillLevel, AnalysisResultItem, DualPersonalityReport, FieldingPlayerRating } from '@/types';

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
    const { mode, handedness, images, dualPersonality: dpOnly, skillLevel }:
      { mode: AnalysisMode; handedness: Handedness; images: string[]; dualPersonality?: boolean; skillLevel?: SkillLevel } = body;

    if (!mode || !handedness || !images || images.length === 0) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // If dualPersonality flag is set, ONLY do dual personality analysis
    if (dpOnly) {
      const dpPrompt = buildDualPersonalityPrompt(mode, handedness, [], skillLevel);
      const dpText = await analyzeWithGemini({ prompt: dpPrompt, images });
      const dpParsed = parseJsonFromResponse(dpText);

      const isFielding = mode === 'fielding';

      function parseFieldingRatings(ratings: any[]): FieldingPlayerRating[] {
        return (ratings || []).map((r: any) => ({
          name: r.name || '選手',
          reaction: r.reaction ?? 0,
          gloveWork: r.gloveWork ?? 0,
          footwork: r.footwork ?? 0,
          throwing: r.throwing ?? 0,
          stability: r.stability ?? 0,
        }));
      }

      function parseBattingRatings(ratings: any[]) {
        return (ratings || []).map((r: any) => ({
          name: r.name || '選手',
          power: r.power ?? 0,
          accuracy: r.accuracy ?? 0,
          stability: r.stability ?? 0,
          coordination: r.coordination ?? 0,
          aggression: r.aggression ?? 0,
        }));
      }

      const dp: DualPersonalityReport = {
        encouragingCoach: {
          strengths: dpParsed.encouragingCoach?.strengths || [],
          suggestedLineup: isFielding ? '' : (dpParsed.encouragingCoach?.suggestedLineup || ''),
          ...(isFielding ? { suggestedPosition: dpParsed.encouragingCoach?.suggestedPosition || '' } : {}),
          ratings: isFielding ? [] : parseBattingRatings(dpParsed.encouragingCoach?.ratings),
          ...(isFielding ? { fieldingRatings: parseFieldingRatings(dpParsed.encouragingCoach?.ratings) } : {}),
          ...(dpParsed.encouragingCoach?.encouragement ? { encouragement: dpParsed.encouragingCoach.encouragement } : {}),
        },
        harshScout: {
          weaknesses: dpParsed.harshScout?.weaknesses || [],
          suggestedLineup: isFielding ? '' : (dpParsed.harshScout?.suggestedLineup || ''),
          ...(isFielding ? { suggestedPosition: dpParsed.harshScout?.suggestedPosition || '' } : {}),
          ratings: isFielding ? [] : parseBattingRatings(dpParsed.harshScout?.ratings),
          ...(isFielding ? { fieldingRatings: parseFieldingRatings(dpParsed.harshScout?.ratings) } : {}),
          ...(dpParsed.harshScout?.roast ? { roast: dpParsed.harshScout.roast } : {}),
        },
      };

      return NextResponse.json({ dualPersonality: dp });
    }

    // Standard analysis only
    const prompt = buildAnalysisPrompt(mode, handedness, [], skillLevel);
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
