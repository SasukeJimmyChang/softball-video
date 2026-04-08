import { AnalysisItem } from '@/types';

/**
 * Professional scoring rubric based on sports biomechanics research:
 * - ASMI (American Sports Medicine Institute) pitching guidelines
 * - Mass General Brigham baseball biomechanics standards
 * - JOSPT batting biomechanics research (Welch et al.)
 * - PMC clinician's guide to pitching biomechanics
 *
 * Each item includes:
 * - Specific phase of motion it applies to
 * - Quantified ideal range from research
 * - Red/Orange/Green thresholds for consistent scoring
 */

export const pitchingItems: AnalysisItem[] = [
  // === 抬腿與預備階段 (Windup / Leg Lift) ===
  { id: 'P-01', name: '掉手肘', description: '【加速期】投球手肘應 ≥ 肩線高度。低於肩線 >15° = red，5-15° = orange。低肘增加 UCL 壓力（ASMI）', category: 'static' },
  { id: 'P-02', name: '抬腿高度', description: '【抬腿期】前膝應抬至髖部高度以上。未達髖部 = orange，僅到大腿中段 = red。充分抬腿蓄力影響球速', category: 'static' },
  { id: 'P-09', name: '支撐腳膝蓋', description: '【抬腿期】後腳膝蓋微蹲儲能。理想 130-160°。>170°（太直）= red，160-170° = orange', category: 'static' },

  // === 跨步階段 (Stride) ===
  { id: 'P-07', name: '跨步踏點方向', description: '【跨步期】前腳應踏向本壘板中線。偏移 >15cm = red，5-15cm = orange（ASMI 建議腳尖微閉合）', category: 'static' },
  { id: 'P-08', name: '跨步距離', description: '【跨步期】理想為身高的 77-87%（ASMI 標準 83±4%）。過短減速，過長增加手臂負擔', category: 'static' },
  { id: 'P-16', name: '踏步腳落地穩定', description: '【跨步期】前腳落地時應穩定、腳尖微閉合 0-20°。腳尖大開或落地不穩 = orange', category: 'static' },

  // === 手臂加速階段 (Arm Acceleration) ===
  { id: 'P-03', name: '投球肘角度', description: '【加速期】肩-肘夾角理想 85-100°（ASMI）。>110° 手肘過直增加受傷風險 = red', category: 'static' },
  { id: 'P-04', name: '肩線傾斜', description: '【加速期】投球側肩應略低 5-15°（ASMI）。水平或投球側偏高 = orange', category: 'static' },
  { id: 'P-05', name: '手套臂收回', description: '【加速期】手套應收至胸前或腋下。手套向外飛開 = red（影響旋轉軸穩定）', category: 'static' },
  { id: 'P-06', name: '放球腕位', description: '【放球點】手腕應在手肘前方且高於肘。腕低於肘 = orange，遠低於肘 = red', category: 'static' },
  { id: 'P-14', name: '上臂出手角度', description: '【加速期】肩到肘與水平線夾角。過頭式 75-100°，3/4 式 45-75°，側投 <45°。超出慣用範圍 = orange', category: 'static' },

  // === 軀幹與核心 (Trunk) ===
  { id: 'P-12', name: '髖肩分離', description: '【跨步期→加速期】髖先轉肩後轉，理想分離角 40-60°（ASMI）。<30° = red（動力鏈斷裂）', category: 'static' },
  { id: 'P-13', name: '軀幹前傾角', description: '【放球點】軀幹應前傾 20-35°。<15° 身體太直 = orange，>40° 過度前傾 = orange', category: 'static' },
  { id: 'P-15', name: '骨盆旋轉量化', description: '【加速期】骨盆最大旋轉速度應達 600-800°/s。觀察兩側髖部對齊度與旋轉方向', category: 'static' },
  { id: 'P-11', name: '頭部穩定', description: '【全程】頭部應保持在軀幹中線。偏移 >10° = orange。頭部甩動影響控球精度', category: 'static' },
  { id: 'P-17', name: '頸部側傾', description: '【加速期】投球側耳與同側肩的距離。過度側傾 >20° = orange（頸椎壓力）', category: 'static' },

  // === 收尾階段 (Follow-through) ===
  { id: 'P-10', name: '收尾動作', description: '【收尾期】手臂應自然跟進至對側髖部。急停或未跟進 = red（手臂減速負擔增加）', category: 'static' },
  { id: 'P-18', name: '支撐腳膝外翻', description: '【落地後】前膝應保持髖-膝-踝對齊。膝內塌 Valgus >10° = red（ACL 風險）', category: 'static' },

  // === 時序動態 (Temporal) ===
  { id: 'T-01', name: '手腕加速時機', description: '【時序】手腕峰速應在放球前 0.02-0.05 秒。過早加速 = orange（鞭打效應不足）', category: 'temporal' },
  { id: 'T-02', name: '肩旋轉爆發力', description: '【時序】肩內旋峰速應達 6000-7500°/s（ASMI）。觀察旋轉加速的流暢度', category: 'temporal' },
  { id: 'T-03', name: '重心前移量', description: '【時序】重心從後腳到前腳的轉移應連續。重心滯後或跳躍式前移 = orange', category: 'temporal' },
];

export const battingItems: AnalysisItem[] = [
  // === 預備站姿 (Stance) ===
  { id: 'B-05', name: '雙腳站距', description: '【站姿】理想為肩寬 1.0-1.4 倍。<1.0 = orange（不穩），>1.6 = red（移動受限）', category: 'static' },
  { id: 'B-14', name: '備棒高度（Load）', description: '【站姿】雙手置於後肩至耳朵高度。低於肩 = orange，低於胸 = red', category: 'static' },
  { id: 'B-09', name: '頭部穩定', description: '【全程】頭部正對投手、下巴靠近前肩。頭部明顯偏離 = orange，無法追蹤球路 = red', category: 'static' },
  { id: 'B-15', name: '脊椎側傾角', description: '【站姿】微微後傾 5-15° 最佳。過度前傾或後傾 >20° = orange', category: 'static' },

  // === 啟動 (Load) ===
  { id: 'B-01', name: '重心前衝', description: '【啟動期】重心應先微移後腳再爆發前移。過早前衝 = red（影響擊球時機與力量）', category: 'static' },
  { id: 'B-02', name: '倒棒', description: '【啟動期】棒頭應保持高於手腕。棒頭低於手腕 = orange，低於肘 = red', category: 'static' },
  { id: 'B-03', name: '後手肘（雞翅）', description: '【啟動期】後肘理想 45-90°、低於肩膀高度。肘與肩同高外展 = orange（雞翅）', category: 'static' },

  // === 跨步 (Stride) ===
  { id: 'B-13', name: '打擊踏步距離', description: '【跨步期】理想 0.3-0.6× 肩寬（短步穩定型）。超過 0.8× = red，無踏步 = blue', category: 'static' },
  { id: 'B-06', name: '前膝角度', description: '【跨步著地】前膝微彎 150-170°。完全鎖死 = orange，過彎 <130° = orange', category: 'static' },

  // === 揮擊 (Swing) ===
  { id: 'B-04', name: '前手肘角度', description: '【揮擊中】前臂引導棒進入擊球區，理想 100-140°。過直 >160° = red（推棒），過彎 <90° = orange', category: 'static' },
  { id: 'B-10', name: '髖部旋轉', description: '【揮擊中】髖先轉肩後轉。髖部最大旋轉速度理想 714°/s。髖肩同時轉 = orange（動力鏈斷裂）', category: 'static' },
  { id: 'B-07', name: '後膝蹬地', description: '【揮擊中】後膝蹬地驅動旋轉。後腳完全平踩 = orange，膝蓋未旋轉 = red', category: 'static' },
  { id: 'B-08', name: '肩線傾斜', description: '【揮擊中】後肩微低 10-20° 產生上揚角度。後肩明顯低於前肩 >30° = orange', category: 'static' },
  { id: 'B-11', name: '前手引導', description: '【揮擊中】前手肘先出、手腕最後翻轉。手腕過早翻 = orange（casting），純推棒 = red', category: 'static' },
  { id: 'B-17', name: '頸部傾斜', description: '【揮擊中】前側耳對齊前肩，視線水平追蹤。頭抬太高或歪斜 = orange', category: 'static' },

  // === 觸擊與延伸 (Contact & Extension) ===
  { id: 'B-16', name: '前手延伸', description: '【觸擊後】雙臂充分延伸，理想 150-175°。未充分延伸 <140° = orange，手臂縮回 = red', category: 'static' },
  { id: 'B-18', name: '後腳膝關節追蹤', description: '【觸擊後】後膝隨旋轉向前，髖-膝-踝對齊。膝內塌 Valgus = orange（ACL 風險）', category: 'static' },

  // === 收尾 (Follow-through) ===
  { id: 'B-12', name: '跟進完整度', description: '【收尾期】棒子完整繞過前肩，雙手自然翻轉。急停或半途放棒 = red，不完整跟進 = orange', category: 'static' },

  // === 時序動態 (Temporal) ===
  { id: 'T-04', name: '揮棒加速時機', description: '【時序】棒速峰值應在觸擊點附近。過早達峰 = orange（力量浪費），過晚 = red', category: 'temporal' },
  { id: 'T-05', name: '肩部旋轉速度', description: '【時序】肩部旋轉峰速理想 937°/s（研究數據）。旋轉延遲或加速不連貫 = orange', category: 'temporal' },
  { id: 'T-06', name: '後腳跟離地', description: '【時序】後腳跟應在髖旋轉開始時離地。過早離地 = orange（重心不穩），不離地 = red（髖鎖死）', category: 'temporal' },
];

export const fieldingItems: AnalysisItem[] = [
  // === 預備 (Ready) ===
  { id: 'F-01', name: '預備姿勢', description: '【預備】雙腳略寬於肩、重心前腳掌、臀部低於肩。站太高 = orange，站太窄 = red', category: 'static' },
  { id: 'F-02', name: '手套位置', description: '【預備】手套貼近地面張開。手套高於膝蓋 = orange（反應延遲）', category: 'static' },
  { id: 'F-03', name: '接球手肘角度', description: '【預備】手肘微彎 20-40°。完全伸直鎖死 = orange（吸震能力差）', category: 'static' },
  { id: 'F-04', name: '雙腳站距', description: '【預備】略寬於肩寬（1.2-1.5 倍）。過窄 = red（反應慢），過寬 = orange（移動慢）', category: 'static' },
  { id: 'F-05', name: '膝蓋彎曲度', description: '【預備】充分彎曲 90-130°。>150° 站太高 = red，<80° 蹲太低 = orange', category: 'static' },
  { id: 'F-06', name: '臀部高度', description: '【預備】臀部低於肩膀。臀部與肩同高或更高 = red', category: 'static' },
  { id: 'F-07', name: '頭部穩定', description: '【全程】頭部正面朝球、視線追蹤。頭偏移或抬頭 = orange', category: 'static' },

  // === 接球 (Field) ===
  { id: 'F-08', name: '裸手位置', description: '【接球】裸手在手套上方 5-10cm 準備蓋球。裸手離太遠 = orange', category: 'static' },
  { id: 'F-09', name: '身體正面朝球', description: '【接球】軀幹正對來球。側身接球 = orange，背對來球 = red', category: 'static' },
  { id: 'F-10', name: '接球後收球動作', description: '【接球→傳球】手套迅速收至腰側出球位。收球路徑太長 = orange', category: 'static' },

  // === 傳球 (Throw) ===
  { id: 'F-11', name: '傳球手臂角度', description: '【傳球】過頭式傳球最準確（肩外展 80-100°）。側拋 <60° = orange（準度差）', category: 'static' },
  { id: 'F-12', name: '跨步傳球方向', description: '【傳球】前腳踏向傳球目標。腳步方向偏離目標 >20° = red', category: 'static' },
  { id: 'F-13', name: '重心轉移', description: '【接→傳】重心從後腳連續轉移至前腳。重心卡住或斷裂 = orange', category: 'static' },
  { id: 'F-14', name: '腳步移動效率', description: '【移動中】碎步接近為佳。交叉腳步 = orange（絆倒風險），跳躍式 = red', category: 'static' },

  // === 時序 (Temporal) ===
  { id: 'FT-01', name: '反應起動速度', description: '【時序】球離棒到第一步移動。理想 <0.3 秒。起動遲疑 = orange，明顯慢 = red', category: 'temporal' },
  { id: 'FT-02', name: '接傳球轉換速度', description: '【時序】接球到出手傳球。理想 <1 秒。動作拖泥帶水 = orange', category: 'temporal' },
  { id: 'FT-03', name: '腳步節奏連貫性', description: '【時序】移動→接球→傳球的節奏應流暢無停頓。有明顯停頓 = orange', category: 'temporal' },
];

export function getAnalysisItems(mode: 'pitching' | 'batting' | 'fielding') {
  if (mode === 'pitching') return pitchingItems;
  if (mode === 'batting') return battingItems;
  return fieldingItems;
}
