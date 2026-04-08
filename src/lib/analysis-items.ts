import { AnalysisItem } from '@/types';

/**
 * Professional scoring rubric based on sports biomechanics research.
 *
 * Sources:
 * - ASMI (American Sports Medicine Institute) pitching guidelines
 * - Welch et al. (JOSPT 1995) — batting biomechanics
 * - PMC 2014 — college-level female softball 3D kinematics
 * - Driveline Baseball — hip-shoulder separation, spine angle
 * - 2025 comparative analysis — novice vs expert rotational acceleration
 *
 * Each item description contains:
 * - [Phase] — which phase of motion
 * - Quantified ideal ranges with red/orange/green thresholds
 * - Beginner and advanced level expectations where applicable
 */

export const pitchingItems: AnalysisItem[] = [
  // === 抬腿與預備 ===
  { id: 'P-01', name: '掉手肘', description: '【加速期】投球手肘應 ≥ 肩線高度。低於肩線 >15° = red，5-15° = orange。新手常見問題。', category: 'static' },
  { id: 'P-02', name: '抬腿高度', description: '【抬腿期】前膝應抬至髖部高度以上。未達髖部 = orange，僅到大腿中段 = red。', category: 'static' },
  { id: 'P-09', name: '支撐腳膝蓋', description: '【抬腿期】後腳膝蓋微蹲 130-160°。>170° = red，160-170° = orange。', category: 'static' },

  // === 跨步 ===
  { id: 'P-07', name: '跨步踏點方向', description: '【跨步期】前腳指向本壘中線，腳尖微閉合 0-20°。偏移 >15cm = red，5-15cm = orange。', category: 'static' },
  { id: 'P-08', name: '跨步距離', description: '【跨步期】理想為身高 77-87%（ASMI 標準 83±4%）。<70% = red，70-77% = orange。', category: 'static' },
  { id: 'P-16', name: '踏步腳落地穩定', description: '【跨步期】前腳落地穩定，腳尖微閉合。落地不穩或大開 = orange。', category: 'static' },

  // === 手臂加速 ===
  { id: 'P-03', name: '投球肘角度', description: '【加速期】肩-肘夾角 85-100°（ASMI）。>110° = red（受傷風險），100-110° = orange。', category: 'static' },
  { id: 'P-04', name: '肩線傾斜', description: '【加速期】投球側肩略低 5-15°。水平或投球側偏高 = orange。', category: 'static' },
  { id: 'P-05', name: '手套臂收回', description: '【加速期】手套收至胸前/腋下。向外飛開 = red，未收緊 = orange。', category: 'static' },
  { id: 'P-06', name: '放球腕位', description: '【放球點】手腕在肘前方且高於肘。腕低於肘 = orange，遠低 = red。', category: 'static' },
  { id: 'P-14', name: '上臂出手角度', description: '【加速期】過頭式 75-100°，3/4 式 45-75°，側投 <45°。', category: 'static' },

  // === 軀幹 ===
  { id: 'P-12', name: '髖肩分離', description: '【跨步→加速】髖先轉肩後轉，理想 40-60°（ASMI）。<30° = red（動力鏈斷裂），30-40° = orange。', category: 'static' },
  { id: 'P-13', name: '軀幹前傾角', description: '【放球點】前傾 20-35°。<15° = orange，>40° = orange。', category: 'static' },
  { id: 'P-15', name: '骨盆旋轉', description: '【加速期】骨盆旋轉速 600-800°/s。觀察髖部對齊度與旋轉方向。', category: 'static' },
  { id: 'P-11', name: '頭部穩定', description: '【全程】頭保持軀幹中線。偏移 >10° = orange。', category: 'static' },
  { id: 'P-17', name: '頸部側傾', description: '【加速期】過度側傾 >20° = orange（頸椎壓力）。', category: 'static' },

  // === 收尾 ===
  { id: 'P-10', name: '收尾動作', description: '【收尾期】手臂自然跟進至對側髖部。急停 = red，未跟進 = orange。', category: 'static' },
  { id: 'P-18', name: '支撐腳膝外翻', description: '【落地後】前膝髖-膝-踝對齊。膝內塌 Valgus >10° = red（ACL 風險）。', category: 'static' },

  // === 時序 ===
  { id: 'T-01', name: '手腕加速時機', description: '【時序】手腕峰速在放球前 0.02-0.05 秒。過早 = orange。', category: 'temporal' },
  { id: 'T-02', name: '肩旋轉爆發力', description: '【時序】肩內旋峰速 6000-7500°/s（ASMI）。觀察加速流暢度。', category: 'temporal' },
  { id: 'T-03', name: '重心前移', description: '【時序】重心應連續轉移。滯後或跳躍式 = orange。', category: 'temporal' },
];

export const battingItems: AnalysisItem[] = [
  // === 預備站姿 (Stance) ===
  { id: 'B-05', name: '雙腳站距', description: '【站姿】肩寬 1.0-1.4 倍。<1.0 = orange（不穩），>1.6 = red。新手 1.2 倍即可，進階追求 1.0-1.2 倍精準站位。', category: 'static' },
  { id: 'B-14', name: '備棒高度', description: '【站姿】雙手後肩至耳高。低於肩 = orange，低於胸 = red。進階選手手部通常在耳朵高度。', category: 'static' },
  { id: 'B-09', name: '頭部穩定', description: '【全程】下巴靠近前肩，視線水平。偏離 = orange，無法追蹤球 = red。', category: 'static' },
  { id: 'B-15', name: '脊椎側傾角', description: '【站姿】微後傾 5-15°。前傾或 >20° = orange。', category: 'static' },
  { id: 'B-19', name: '重心分配', description: '【站姿】後腳 55-60% / 前腳 40-45%。重心過度偏前或偏後 = orange。新手常過度後坐。', category: 'static' },
  { id: 'B-20', name: '膝蓋彎曲度', description: '【站姿】微蹲 140-160°。站太直 >170° = orange（爆發力不足），蹲太低 <130° = orange。', category: 'static' },

  // === 啟動 (Load) ===
  { id: 'B-01', name: '重心前衝', description: '【啟動】重心應先微後移再前移。過早前衝 = red。新手最常見錯誤。', category: 'static' },
  { id: 'B-02', name: '倒棒', description: '【啟動】棒頭應高於手腕。低於手腕 = orange，低於肘 = red。', category: 'static' },
  { id: 'B-03', name: '後手肘', description: '【啟動】後肘 45-90°、低於肩。肘與肩同高外展（雞翅）= orange。進階選手肘通常 60-75°。', category: 'static' },

  // === 跨步 (Stride) ===
  { id: 'B-13', name: '踏步距離', description: '【跨步】0.3-0.6× 肩寬。>0.8× = red，無踏步 = blue。新手可接受較短步，進階追求穩定 0.4-0.5×。', category: 'static' },
  { id: 'B-06', name: '前膝角度', description: '【跨步著地】150-170°微彎。完全鎖死 180° = orange，<130° 過彎 = orange。', category: 'static' },
  { id: 'B-21', name: '前腳著地角度', description: '【跨步】前腳尖應微閉合約 45°。腳尖大開朝投手 = orange（髖提早打開），腳尖完全內扣 = orange。', category: 'static' },

  // === 揮擊 (Swing) ===
  { id: 'B-04', name: '前手肘角度', description: '【揮擊】引導棒進球區 100-140°。>160° = red（推棒），<90° = orange。', category: 'static' },
  { id: 'B-10', name: '髖部旋轉', description: '【揮擊】髖先轉肩後轉。峰速 714°/s（研究值）。髖肩同時轉 = orange。進階選手髖領先 40-60ms。', category: 'static' },
  { id: 'B-07', name: '後膝蹬地', description: '【揮擊】後膝蹬地驅動旋轉。完全平踩 = orange，膝未旋轉 = red。', category: 'static' },
  { id: 'B-08', name: '肩線傾斜', description: '【揮擊】後肩微低 10-20° 產生上揚角。>30° = orange。', category: 'static' },
  { id: 'B-11', name: '前手引導', description: '【揮擊】前肘先出、手腕最後翻。手腕過早翻（casting）= orange，純推棒 = red。', category: 'static' },
  { id: 'B-17', name: '頸部傾斜', description: '【揮擊】前耳對齊前肩，視線水平。頭抬或歪 = orange。', category: 'static' },
  { id: 'B-22', name: '觸擊時後臂角度', description: '【觸擊】後臂約呈 90° L 型。過直 >130° = orange（力臂過長），過彎 <70° = orange。', category: 'static' },
  { id: 'B-23', name: '觸擊時重心分配', description: '【觸擊】前腳約承受 75-85% 體重。重心仍在後腳 = red（力量未轉移）。', category: 'static' },

  // === 延伸與收尾 ===
  { id: 'B-16', name: '前手延伸', description: '【觸擊後】雙臂延伸 150-175°。<140° = orange，手臂縮回 = red。', category: 'static' },
  { id: 'B-18', name: '後腳膝關節追蹤', description: '【觸擊後】後膝前轉，髖膝踝對齊。膝內塌 Valgus = orange。', category: 'static' },
  { id: 'B-12', name: '跟進完整度', description: '【收尾】棒繞過前肩，手自然翻轉。急停或放棒 = red，不完整 = orange。', category: 'static' },

  // === 時序 ===
  { id: 'T-04', name: '揮棒加速時機', description: '【時序】棒速峰值在觸擊點附近。過早達峰 = orange，過晚 = red。進階選手峰值更接近觸擊。', category: 'temporal' },
  { id: 'T-05', name: '動力鏈傳遞', description: '【時序】髖→軀幹→肩→肘→手腕依序加速（proximal-to-distal）。順序混亂 = red。新手常見手主導（手先動）。', category: 'temporal' },
  { id: 'T-06', name: '後腳跟離地', description: '【時序】後腳跟在髖旋轉開始時離地。過早 = orange（不穩），不離地 = red（髖鎖死）。', category: 'temporal' },
  { id: 'T-07', name: '揮棒時間', description: '【時序】從啟動到觸擊。新手約 0.20 秒，進階約 0.17 秒。觀察是否有猶豫或二次啟動。', category: 'temporal' },
];

export const fieldingItems: AnalysisItem[] = [
  // === 預備 ===
  { id: 'F-01', name: '預備姿勢', description: '【預備】雙腳略寬於肩、重心前腳掌。站太高 = orange，太窄 = red。', category: 'static' },
  { id: 'F-02', name: '手套位置', description: '【預備】手套貼近地面張開。高於膝 = orange。', category: 'static' },
  { id: 'F-03', name: '接球手肘角度', description: '【預備】手肘微彎 20-40°。伸直鎖死 = orange。', category: 'static' },
  { id: 'F-04', name: '雙腳站距', description: '【預備】肩寬 1.2-1.5 倍。過窄 = red，過寬 = orange。', category: 'static' },
  { id: 'F-05', name: '膝蓋彎曲度', description: '【預備】90-130°。>150° = red（太高），<80° = orange（太低）。', category: 'static' },
  { id: 'F-06', name: '臀部高度', description: '【預備】臀部低於肩膀。與肩同高或更高 = red。', category: 'static' },
  { id: 'F-07', name: '頭部穩定', description: '【全程】頭正面朝球。偏移或抬頭 = orange。', category: 'static' },
  // === 接球 ===
  { id: 'F-08', name: '裸手位置', description: '【接球】裸手在手套上方 5-10cm。離太遠 = orange。', category: 'static' },
  { id: 'F-09', name: '身體正面朝球', description: '【接球】軀幹正對來球。側身 = orange，背對 = red。', category: 'static' },
  { id: 'F-10', name: '收球動作', description: '【接→傳】手套迅速收至腰側。路徑太長 = orange。', category: 'static' },
  // === 傳球 ===
  { id: 'F-11', name: '傳球手臂角度', description: '【傳球】過頭式 80-100°。側拋 <60° = orange。', category: 'static' },
  { id: 'F-12', name: '跨步傳球方向', description: '【傳球】前腳踏向目標。偏離 >20° = red。', category: 'static' },
  { id: 'F-13', name: '重心轉移', description: '【接→傳】後腳→前腳連續轉移。卡住 = orange。', category: 'static' },
  { id: 'F-14', name: '腳步移動效率', description: '【移動】碎步接近。交叉步 = orange，跳躍 = red。', category: 'static' },
  // === 時序 ===
  { id: 'FT-01', name: '反應起動速度', description: '【時序】球離棒到第一步 <0.3 秒。起動遲疑 = orange。', category: 'temporal' },
  { id: 'FT-02', name: '接傳球轉換速度', description: '【時序】接球到出手 <1 秒。拖泥帶水 = orange。', category: 'temporal' },
  { id: 'FT-03', name: '腳步節奏連貫性', description: '【時序】移動→接球→傳球無停頓。有停頓 = orange。', category: 'temporal' },
];

export function getAnalysisItems(mode: 'pitching' | 'batting' | 'fielding') {
  if (mode === 'pitching') return pitchingItems;
  if (mode === 'batting') return battingItems;
  return fieldingItems;
}
