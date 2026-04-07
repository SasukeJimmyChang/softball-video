import { AnalysisItem } from '@/types';

export const pitchingItems: AnalysisItem[] = [
  // Static items P-01 ~ P-18
  { id: 'P-01', name: '掉手肘', description: '投球手肘低於肩線，增加 UCL 壓力', category: 'static' },
  { id: 'P-02', name: '抬腿高度', description: '跨步膝超過髖部，蓄力是否充分', category: 'static' },
  { id: 'P-03', name: '投球肘角度', description: '肩-肘-腕夾角，理想 85-110°', category: 'static' },
  { id: 'P-04', name: '肩線傾斜', description: '投球肩應略低，軀幹前傾方向', category: 'static' },
  { id: 'P-05', name: '手套臂收回', description: '手套側肘不應過度向外展開', category: 'static' },
  { id: 'P-06', name: '放球腕位', description: '手腕不應低於手肘過多', category: 'static' },
  { id: 'P-07', name: '跨步踏點方向', description: '踏步應指向本壘板方向', category: 'static' },
  { id: 'P-08', name: '跨步距離', description: '過短或過長均影響球速與控球', category: 'static' },
  { id: 'P-09', name: '支撐腳膝蓋', description: '應保持微蹲儲能，理想 130-160°', category: 'static' },
  { id: 'P-10', name: '收尾動作', description: '手臂跟進至對側腰部以下', category: 'static' },
  { id: 'P-11', name: '頭部穩定', description: '偏離軀幹中線影響定位視線', category: 'static' },
  { id: 'P-12', name: '髖肩分離', description: '下沉髖部帶動肩旋轉時機', category: 'static' },
  { id: 'P-13', name: '軀幹前傾角', description: '肩心與髖心水平偏移，理想前傾 15-25°', category: 'static' },
  { id: 'P-14', name: '上臂出手角度', description: '肩到肘與水平線夾角，過頭式 vs 側投', category: 'static' },
  { id: 'P-15', name: '骨盆旋轉量化', description: '兩側髖部水平對齊度，旋轉路徑評估', category: 'static' },
  { id: 'P-16', name: '踏步腳落地穩定', description: 'AI 關鍵點信心分數，偵測落地可靠度', category: 'static' },
  { id: 'P-17', name: '頸部側傾', description: '投球側耳 vs 肩膀高度差，頸椎傷害風險', category: 'static' },
  { id: 'P-18', name: '支撐腳膝外翻', description: '髖-膝-踝三點對齊，Valgus/Varus 偵測', category: 'static' },
  // Temporal items T-01 ~ T-03
  { id: 'T-01', name: '手腕加速時機', description: '跨幀速度曲線，放球前鞭打時機評估', category: 'temporal' },
  { id: 'T-02', name: '肩旋轉爆發力', description: '肩線角度每幀變化量，上半身旋轉速度', category: 'temporal' },
  { id: 'T-03', name: '重心前移量', description: '髖心 X 軸位移，下半身動能傳遞評估', category: 'temporal' },
];

export const battingItems: AnalysisItem[] = [
  // Static items B-01 ~ B-18
  { id: 'B-01', name: '重心前衝', description: '頭部過早移向前腳影響擊球時機', category: 'static' },
  { id: 'B-02', name: '倒棒', description: '後手腕低於後肘，棒頭下垂', category: 'static' },
  { id: 'B-03', name: '後手肘（雞翅）', description: '後肘應保持肩膀高度', category: 'static' },
  { id: 'B-04', name: '前手肘角度', description: '引導棒進球區，理想 100-140°', category: 'static' },
  { id: 'B-05', name: '雙腳站距', description: '肩寬 1.0-1.6 倍為理想站距', category: 'static' },
  { id: 'B-06', name: '前膝角度', description: '踏步後支撐，理想 100-155°', category: 'static' },
  { id: 'B-07', name: '後膝蹬地', description: '後腳蹬地爆發，過直失去動能', category: 'static' },
  { id: 'B-08', name: '肩線傾斜', description: '後肩不應明顯低於前肩', category: 'static' },
  { id: 'B-09', name: '頭部穩定', description: '頭低視線無法追蹤球路', category: 'static' },
  { id: 'B-10', name: '髖部旋轉', description: '偵測旋腰動作與傾斜方向', category: 'static' },
  { id: 'B-11', name: '前手引導', description: '推棒 vs. 拉棒偵測', category: 'static' },
  { id: 'B-12', name: '跟進完整度', description: '雙腕交叉翻轉確認完整跟進', category: 'static' },
  { id: 'B-13', name: '打擊踏步距離', description: '踏步幅度，理想 0.4-0.7× 肩寬', category: 'static' },
  { id: 'B-14', name: '備棒高度（Load）', description: '雙手應置於耳旁至肩上方', category: 'static' },
  { id: 'B-15', name: '脊椎側傾角', description: '肩心 vs 髖心偏移，後傾 5-20° 最佳', category: 'static' },
  { id: 'B-16', name: '前手延伸', description: '出棒後手臂伸展度，理想 140-170°', category: 'static' },
  { id: 'B-17', name: '頸部傾斜', description: '前側耳 vs 前肩高度，視線穩定評估', category: 'static' },
  { id: 'B-18', name: '後腳膝關節追蹤', description: '旋腰時後膝是否內塌（Valgus）偵測', category: 'static' },
  // Temporal items T-04 ~ T-06
  { id: 'T-04', name: '揮棒加速時機', description: '手腕速度峰值位置，棒速代理指標', category: 'temporal' },
  { id: 'T-05', name: '肩部旋轉速度', description: '肩線角度變化量，旋腰爆發力評估', category: 'temporal' },
  { id: 'T-06', name: '後腳跟離地', description: '後踝 Y 軸位移，髖部旋轉驅動確認', category: 'temporal' },
];

export const fieldingItems: AnalysisItem[] = [
  // Static items F-01 ~ F-14
  { id: 'F-01', name: '預備姿勢', description: '雙腳與肩同寬微蹲，重心放前腳掌，手套觸地準備', category: 'static' },
  { id: 'F-02', name: '手套位置', description: '手套應貼近地面張開，手套口朝球方向', category: 'static' },
  { id: 'F-03', name: '接球手肘角度', description: '手肘微彎保持彈性，不應完全伸直鎖死', category: 'static' },
  { id: 'F-04', name: '雙腳站距', description: '站距適中，過窄反應慢，過寬移動受限', category: 'static' },
  { id: 'F-05', name: '膝蓋彎曲度', description: '膝蓋應充分彎曲降低重心，理想 90-130°', category: 'static' },
  { id: 'F-06', name: '臀部高度', description: '臀部應低於肩膀，確保視線能追蹤滾地球', category: 'static' },
  { id: 'F-07', name: '頭部穩定', description: '頭部保持正面朝球，視線不應偏移', category: 'static' },
  { id: 'F-08', name: '裸手位置', description: '裸手應在手套上方準備蓋球，防止彈出', category: 'static' },
  { id: 'F-09', name: '身體正面朝球', description: '軀幹應正對來球方向，不應側身接球', category: 'static' },
  { id: 'F-10', name: '接球後收球動作', description: '接球後手套迅速收至腰部，準備傳球', category: 'static' },
  { id: 'F-11', name: '傳球手臂角度', description: '傳球時肩-肘-腕夾角，過頭式傳球最準確', category: 'static' },
  { id: 'F-12', name: '跨步傳球方向', description: '傳球腳步應踏向目標方向', category: 'static' },
  { id: 'F-13', name: '重心轉移', description: '接球到傳球的重心由後腳轉移至前腳', category: 'static' },
  { id: 'F-14', name: '腳步移動效率', description: '移動時碎步接近，不應交叉腳步', category: 'static' },
  // Temporal items FT-01 ~ FT-03
  { id: 'FT-01', name: '反應起動速度', description: '球離棒到第一步移動的時間差', category: 'temporal' },
  { id: 'FT-02', name: '接傳球轉換速度', description: '手套接球到傳球出手的時間差', category: 'temporal' },
  { id: 'FT-03', name: '腳步節奏連貫性', description: '移動-接球-傳球的整體節奏流暢度', category: 'temporal' },
];

export function getAnalysisItems(mode: 'pitching' | 'batting' | 'fielding') {
  if (mode === 'pitching') return pitchingItems;
  if (mode === 'batting') return battingItems;
  return fieldingItems;
}
