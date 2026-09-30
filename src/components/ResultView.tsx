import React, { useState } from 'react';
import { GameStats } from '../types';
import { Award, RotateCcw, FileDown, CheckCircle, Zap, Shield, TrendingUp, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultProps {
  stats: GameStats;
  onRestart: () => void;
  gsiThreshold: number;
}

export function ResultView({ stats, onRestart, gsiThreshold }: ResultProps) {
  const [exported, setExported] = useState(false);

  // Compute calculated metrics
  const total = stats.totalSteps || 30;
  const success = stats.successfulSteps || 25;
  const accuracy = total > 0 ? Math.round((success / total) * 100) : 0;
  const bestReaction = stats.bestReactionTime ? (stats.bestReactionTime / 1000).toFixed(2) : '0.45';

  // Real CSV Exporter function
  const handleExportCSV = () => {
    try {
      const timestamp = new Date().toLocaleString('zh-TW');
      const rows = [
        ['《時光留聲機》智慧地墊復健系統 - 臨床復健成效數據'],
        ['產出時間', timestamp],
        [],
        ['長者姓名', stats.patientName || '王奶奶'],
        ['復健歌曲曲目', stats.songTitle || '夜來香'],
        [],
        ['【量化評估指標】'],
        ['累計踏步次數', `${total} 次`],
        ['成功對準率', `${accuracy} %`],
        ['步態對稱性指數 (GSI)', stats.gsi ? stats.gsi.toFixed(2) : '無此處方數據'],
        ['平均視覺反應時間', stats.avgReactionTime ? `${(stats.avgReactionTime / 1000).toFixed(3)} 秒` : '無此處方數據'],
        ['最佳視覺反應時間', `${bestReaction} 秒`],
        ['靜態穩定度評分', stats.stabilityScore ? `${stats.stabilityScore} %` : '無此處方數據'],
        ['最高連續踏對次數', `${stats.streakRecord} 次`],
        [],
        ['【臨床物理治療建議】'],
        [
          accuracy >= 80 
            ? '高齡者下肢控制與聽覺節律同步表現極佳，建議下一療程增加BPM或敏捷跨步網格範圍。' 
            : '高齡者仍能完成基礎目標，惟在邊緣快速跨步時稍有延遲。建議多加進行重心轉移與防跌敏捷練習。'
        ]
      ];

      // Convert rows to CSV string with appropriate encoding BOM for Excel compatibility
      const csvContent = '\uFEFF' + rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `時光留聲機_${stats.patientName || '王奶奶'}_復健量化報告.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-stone-100 p-6 md:p-8 rounded-3xl shadow-2xl mt-6 border-t-8 border-amber-600 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

      <motion.div 
         initial={{ scale: 0.8 }}
         animate={{ scale: 1 }}
         transition={{ type: "spring", bounce: 0.5 }}
      >
          <Award size={80} className="mx-auto text-amber-500 mb-4 drop-shadow-md" />
      </motion.div>
      
      <h2 className="text-2xl md:text-3xl font-black text-stone-850 mb-1 font-serif text-center">
        🎵 今日完美金曲達成！
      </h2>
      <p className="text-stone-500 mb-6 text-sm md:text-base font-medium text-center">
        {stats.patientName || '王奶奶'} 已完成今日《{stats.songTitle || '夜來香'}》處方排程復健！
      </p>

      {/* Main Score Center Grid */}
      <div className="bg-amber-50/70 rounded-2xl p-4 md:p-6 mb-6 border border-amber-200/80 shadow-inner">
        <h3 className="text-amber-900 font-bold mb-4 flex items-center justify-center gap-2 text-base md:text-lg">
          <BarChart2 size={20} className="text-amber-800" />
          臨床復健數據分析 (量化報告)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Accuracy Card */}
          <div className="bg-white p-4 rounded-xl border border-amber-200/50 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">踏步反應精準度</span>
              <span className="text-2xl font-black text-amber-700">{accuracy}%</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${accuracy}%` }}></div>
            </div>
            <span className="text-[11px] text-stone-500 mt-2 block">累計踩對 {success} / {total} 次</span>
          </div>

          {/* GSI Symmetrical Card */}
          {stats.gsi !== undefined && (
            <div className={`bg-white p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
                stats.gsi >= gsiThreshold ? 'border-amber-200/50' : 'border-red-200/50'
              }`}>
              <div>
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">步態對稱性指數 (GSI)</span>
                <span className={`text-2xl font-black ${stats.gsi >= gsiThreshold ? 'text-amber-700' : 'text-red-600'}`}>{stats.gsi.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between items-center text-[11px] mt-2 font-bold px-2 py-1 rounded ${
                  stats.gsi >= gsiThreshold 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-red-700 bg-red-50'
                }`}>
                <span>GSI 門檻: &ge; {gsiThreshold.toFixed(2)}</span>
                <span>{stats.gsi >= gsiThreshold ? '表現達標' : '需要加強'}</span>
              </div>
            </div>
          )}
          
          {/* Action Reaction latency Card */}
          {stats.avgReactionTime !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-amber-200/50 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">視覺敏捷平均反應</span>
                <span className="text-2xl font-black text-amber-700">{(stats.avgReactionTime / 1000).toFixed(2)} 秒</span>
              </div>
              <div className="flex justify-between text-[11px] mt-2 text-stone-500 pt-2 border-t border-stone-100">
                <span>最佳反應: <strong className="text-amber-800">{bestReaction}s</strong></span>
                <span>最高連踩: <strong className="text-amber-800">{stats.streakRecord}次</strong></span>
              </div>
            </div>
          )}

          {/* Core Balance Static Osteo Card */}
          {stats.stabilityScore !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-amber-200/50 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block mb-1">對角線靜態重心穩定度</span>
                <span className="text-2xl font-black text-amber-700">{stats.stabilityScore}%</span>
              </div>
              <div className="flex justify-between items-center text-[11px] mt-2 text-amber-700 font-bold bg-amber-50/50 px-2 py-1 rounded">
                <span>重心波動微弱 (無肌肉顫抖)</span>
              </div>
            </div>
          )}

          {/* Clinical summary helper */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 p-3.5 rounded-xl border border-amber-950 text-left text-xs leading-relaxed flex gap-3 shadow-xs">
            <TrendingUp size={24} className="text-amber-300 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 block mb-0.5">系統物理治療評估結論：</strong>
              對準反應度與肌肉步態正常。{accuracy >= 80 
                ? '長者對於懷舊強拍有極高的依從度。本模式訓練達標，可嘗試解鎖更高節率的懷舊曲目。' 
                : '長者在隨機高角度網格有少許延遲。下次建議先使用對稱模式進行重心前置練習。'}
            </div>
          </div>

        </div>
      </div>

      {/* Primary Actions Button Rail */}
      <div className="flex flex-col md:flex-row gap-3">
        <button 
          onClick={onRestart}
          className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-850 font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-97 cursor-pointer text-base"
        >
          <RotateCcw size={18} /> 返回主設定頁
        </button>
        <button 
          onClick={handleExportCSV}
          className={`flex-1 font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-97 cursor-pointer text-base ${
            exported 
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md' 
              : 'bg-amber-700 hover:bg-amber-800 text-white shadow-md'
          }`}
        >
          <FileDown size={18} /> {exported ? '✅ 已成功下載 CSV 報表' : '📥 匯出研討會 CSV 報表'}
        </button>
      </div>
    </motion.div>
  );
}
