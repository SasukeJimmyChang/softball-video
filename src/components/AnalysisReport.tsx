'use client';

import { AnalysisResultItem, DualPersonalityReport, StatusColor } from '@/types';

interface AnalysisReportProps {
  results: AnalysisResultItem[] | null;
  isAnalyzing: boolean;
  summary: string | null;
  dualPersonality: DualPersonalityReport | null;
}

const statusConfig: Record<StatusColor, { bg: string; border: string }> = {
  red: { bg: 'bg-red-50', border: 'border-red-400' },
  orange: { bg: 'bg-amber-50', border: 'border-amber-400' },
  green: { bg: 'bg-green-50', border: 'border-green-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-400' },
};

const statusBadgeColor: Record<StatusColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-amber-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
};

function RatingBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs w-6 text-right">{value}</span>
    </div>
  );
}

function DualPersonalitySection({ report }: { report: DualPersonalityReport }) {
  return (
    <div className="space-y-6">
      {/* Encouraging Coach */}
      <div className="border-2 border-green-300 rounded-xl overflow-hidden">
        <div className="bg-green-600 px-4 py-3 text-white font-bold flex items-center gap-2">
          <span className="text-xl">&#128588;</span>
          <span>一、鼓勵教練的溫馨統整報告</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Strengths */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">&#127775; 球員優點與分析</h4>
            <ul className="space-y-2">
              {report.encouragingCoach.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm bg-green-50 p-2 rounded-lg">
                  <span className="text-green-600 font-bold shrink-0">&#10004;</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lineup */}
          <div>
            <h4 className="font-bold text-green-700 mb-2">&#9918; 教練版建議棒次</h4>
            <p className="text-sm bg-green-50 p-3 rounded-lg">{report.encouragingCoach.suggestedLineup}</p>
          </div>

          {/* Ratings */}
          {report.encouragingCoach.ratings.length > 0 && (
            <div>
              <h4 className="font-bold text-green-700 mb-2">&#128200; 教練版能力評分</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-50 text-green-800">
                      <th className="p-2 text-left">選手</th>
                      <th className="p-2">爆</th>
                      <th className="p-2">準</th>
                      <th className="p-2">穩</th>
                      <th className="p-2">協</th>
                      <th className="p-2">積極</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.encouragingCoach.ratings.map((r, i) => (
                      <tr key={i} className="border-t border-green-100">
                        <td className="p-2 font-semibold">{r.name}</td>
                        <td className="p-1"><RatingBar value={r.power} color="bg-green-500" /></td>
                        <td className="p-1"><RatingBar value={r.accuracy} color="bg-green-500" /></td>
                        <td className="p-1"><RatingBar value={r.stability} color="bg-green-500" /></td>
                        <td className="p-1"><RatingBar value={r.coordination} color="bg-green-500" /></td>
                        <td className="p-1"><RatingBar value={r.aggression} color="bg-green-500" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Encouragement */}
          {(report.encouragingCoach as any).encouragement && (
            <div className="bg-green-100 p-3 rounded-lg text-sm italic text-green-800">
              &#128154; {(report.encouragingCoach as any).encouragement}
            </div>
          )}
        </div>
      </div>

      {/* Harsh Scout */}
      <div className="border-2 border-red-300 rounded-xl overflow-hidden">
        <div className="bg-red-600 px-4 py-3 text-white font-bold flex items-center gap-2">
          <span className="text-xl">&#128520;</span>
          <span>二、毒舌球探的殘酷實話報告</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Weaknesses */}
          <div>
            <h4 className="font-bold text-red-700 mb-2">&#128163; 致命缺點分析</h4>
            <ul className="space-y-2">
              {report.harshScout.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm bg-red-50 p-2 rounded-lg">
                  <span className="text-red-600 font-bold shrink-0">&#10008;</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lineup */}
          <div>
            <h4 className="font-bold text-red-700 mb-2">&#9918; 球探版建議棒次</h4>
            <p className="text-sm bg-red-50 p-3 rounded-lg">{report.harshScout.suggestedLineup}</p>
          </div>

          {/* Ratings */}
          {report.harshScout.ratings.length > 0 && (
            <div>
              <h4 className="font-bold text-red-700 mb-2">&#128200; 球探版能力評分</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 text-red-800">
                      <th className="p-2 text-left">選手</th>
                      <th className="p-2">爆</th>
                      <th className="p-2">準</th>
                      <th className="p-2">穩</th>
                      <th className="p-2">協</th>
                      <th className="p-2">積極</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.harshScout.ratings.map((r, i) => (
                      <tr key={i} className="border-t border-red-100">
                        <td className="p-2 font-semibold">{r.name}</td>
                        <td className="p-1"><RatingBar value={r.power} color="bg-red-500" /></td>
                        <td className="p-1"><RatingBar value={r.accuracy} color="bg-red-500" /></td>
                        <td className="p-1"><RatingBar value={r.stability} color="bg-red-500" /></td>
                        <td className="p-1"><RatingBar value={r.coordination} color="bg-red-500" /></td>
                        <td className="p-1"><RatingBar value={r.aggression} color="bg-red-500" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roast */}
          {(report.harshScout as any).roast && (
            <div className="bg-red-100 p-3 rounded-lg text-sm italic text-red-800">
              &#128293; {(report.harshScout as any).roast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisReport({ results, isAnalyzing, summary, dualPersonality }: AnalysisReportProps) {
  const hasResults = results || dualPersonality;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden text-gray-800">
      <div className="bg-gray-800 px-4 py-2 text-white font-bold flex items-center gap-2">
        <span>&#128202;</span> AI 動作分析報告
      </div>
      <div className="p-4">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-4xl mb-4 animate-spin">&#9881;</div>
            <p className="text-lg font-semibold">AI 分析中...</p>
            <p className="text-sm">正在將影格送入 Gemini API 進行姿勢分析</p>
          </div>
        ) : hasResults ? (
          <div className="space-y-6">
            {/* Standard Analysis */}
            {results && (
              <>
                {summary && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <strong>&#128161; 總評：</strong> {summary}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((item) => {
                    const config = statusConfig[item.status];
                    return (
                      <div
                        key={item.id}
                        className={`${config.bg} border-l-4 ${config.border} rounded-lg p-3`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`${statusBadgeColor[item.status]} text-white text-xs font-bold px-2 py-0.5 rounded`}
                          >
                            {item.id}
                          </span>
                          <span className="font-bold text-sm">{item.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Dual Personality Report */}
            {dualPersonality && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>&#127917;</span> 雙人格教練分析
                  </h3>
                </div>
                <DualPersonalitySection report={dualPersonality} />
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-4xl mb-4">&#129302;</div>
            <p className="text-lg font-semibold">等待分析開始</p>
            <p className="text-sm">請上傳影片並點擊開始分析</p>
            <p className="text-sm">AI 將自動每 0.1 秒分析一幀</p>
            <p className="text-sm">產生完整動作診斷報告</p>
          </div>
        )}
      </div>
    </div>
  );
}
