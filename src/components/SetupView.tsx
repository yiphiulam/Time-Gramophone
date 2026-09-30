import React, { useState } from 'react';
import { RehabMode } from '../types';
import { SONGS } from '../utils/songs';
import { User, Activity, Play, Music, Radio, Sliders } from 'lucide-react';

interface SetupProps {
  onStart: (patientId: string, mode: RehabMode, songId: string, gsiThreshold: number) => void;
}

export function SetupView({ onStart }: SetupProps) {
  const [patient, setPatient] = useState('p1');
  const [mode, setMode] = useState<RehabMode>('sarcopenia'); // Default to multidirectional agility sarcopenia mode as requested
  const [songId, setSongId] = useState('yelaixiang');
  const [gsiThreshold, setGsiThreshold] = useState(0.90);

  const patients = [
    { id: 'p1', name: '王奶奶', age: 82, condition: '右側中風且伴隨輕度步態不穩' },
    { id: 'p2', name: '李爺爺', age: 75, condition: '肌少症前期、防跌倒反應訓練' },
    { id: 'p3', name: '林阿姨', age: 68, condition: '退化性膝關節炎護理、本體感覺增強' }
  ];

  const getSelectedPatient = () => patients.find(p => p.id === patient) || patients[0];

  return (
    <div className="max-w-2xl mx-auto bg-stone-100 p-6 md:p-8 rounded-3xl shadow-xl mt-6 border-t-8 border-amber-700 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col items-center mb-6">
        <div className="bg-amber-800 text-amber-100 p-3 rounded-full mb-3 shadow-md">
          <Radio size={36} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-serif text-amber-900 font-bold text-center">
          時光留聲機
        </h1>
        <p className="text-amber-700 font-medium text-sm mt-1 tracking-widest text-center">
          智慧地墊復健系統 • 臨床專業評估與嚴肅遊戲
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Patient Selection */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          <label className="block text-stone-700 font-bold mb-2 flex items-center gap-2 text-base md:text-lg">
            <User size={20} className="text-amber-700" /> 第一步：選擇受測長者
          </label>
          <select 
            value={patient} 
            onChange={e => setPatient(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-stone-200 text-stone-800 font-medium bg-stone-50 focus:border-amber-500 focus:bg-white outline-none transition-colors"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.age}歲) - {p.condition}</option>
            ))}
          </select>
          <div className="mt-2 text-xs text-amber-800/70 bg-amber-50 p-2 rounded border border-amber-100 italic">
            💡 當前病歷評估建議：{getSelectedPatient().condition}
          </div>
        </div>

        {/* Step 2: Rehab Mode Selection */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          <label className="block text-stone-700 font-bold mb-3 flex items-center gap-2 text-base md:text-lg">
            <Activity size={20} className="text-amber-700" /> 第二步：設定復健處方 (遊戲模式)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'sarcopenia', name: '多向敏捷模式', desc: '肌少症防跌', highlight: '反應速度與邊緣跨步' },
              { id: 'stroke', name: '對稱節律模式', desc: '中風後偏癱', highlight: '強拍左右力道反饋' },
              { id: 'osteo', name: '靜態本體感覺', desc: '關節炎保養', highlight: '對角線微蹲平衡控壓' }
            ].map(m => (
              <label 
                key={m.id}
                className={`flex flex-col justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === m.id 
                    ? 'border-amber-600 bg-amber-50 shadow-sm scale-[1.02]' 
                    : 'border-stone-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === m.id}
                    onChange={() => setMode(m.id as RehabMode)}
                    className="mt-1 accent-amber-700 cursor-pointer"
                  />
                  <div className="-mt-0.5">
                    <span className="font-bold text-stone-800 text-sm block">{m.name}</span>
                    <span className="text-amber-800 text-xs font-semibold">{m.desc}</span>
                  </div>
                </div>
                <span className="text-stone-500 text-[11px] leading-tight block mt-2 pt-2 border-t border-stone-100">{m.highlight}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 3: nostalgic classical song selection */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          <label className="block text-stone-700 font-bold mb-3 flex items-center gap-2 text-base md:text-lg">
            <Music size={20} className="text-amber-700" /> 第三步：伴奏懷舊曲目
          </label>
          <div className="space-y-2">
            {SONGS.map(song => (
              <label 
                key={song.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  songId === song.id ? 'border-amber-600 bg-amber-50/70' : 'border-stone-100 bg-stone-50 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${songId === song.id ? 'bg-amber-700' : 'bg-stone-300'} text-white transition-colors`}>
                    <Music size={16} className={`${songId === song.id ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <span className="font-bold text-stone-800 text-sm block md:text-base">{song.title}</span>
                    <span className="text-xs text-stone-500">{song.artist} ({song.year}年) • {song.bpm} BPM</span>
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="song" 
                  checked={songId === song.id}
                  onChange={() => setSongId(song.id)}
                  className="accent-amber-700 w-4 h-4 cursor-pointer" 
                />
              </label>
            ))}
          </div>
        </div>

        {/* Step 4: GSI Threshold Setting */}
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          <label className="block text-stone-700 font-bold mb-3 flex items-center gap-2 text-base md:text-lg">
            <Sliders size={20} className="text-amber-700" /> 第四步：步態對稱性指數(GSI) 門檻
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-stone-500 px-1 font-semibold">
              <span>寬鬆 (0.80)</span>
              <span>標準 (0.90)</span>
              <span>嚴格 (0.95)</span>
            </div>
            <input 
              type="range" 
              min="0.80" 
              max="0.95" 
              step="0.01" 
              value={gsiThreshold} 
              onChange={e => setGsiThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-700 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2 font-bold text-amber-800">
              目前設定門檻：{gsiThreshold.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-500 text-center leading-tight">
              當 GSI 高於此門檻時系統將判定為正常表現，此設定協助治療師針對不同復原階段調整目標。
            </p>
          </div>
        </div>

        {/* Start Game Button */}
        <button 
          onClick={() => onStart(patient, mode, songId, gsiThreshold)}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 px-6 rounded-xl text-lg flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-md hover:shadow-lg mt-4"
        >
          <Play fill="currentColor" size={20} /> 啟動處方 • 開始復健
        </button>
      </div>
    </div>
  );
}

