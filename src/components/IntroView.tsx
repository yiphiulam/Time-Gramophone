import React from 'react';
import { Play, Sparkles, Activity, ShieldAlert, Wifi } from 'lucide-react';

interface IntroViewProps {
  onNext: () => void;
}

export function IntroView({ onNext }: IntroViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden shadow-amber-900/10 border border-amber-100">
        <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black text-amber-50 mb-4 tracking-tight">WhizToys 黑膠留聲機</h1>
            <p className="text-amber-100/90 text-lg sm:text-2xl font-medium tracking-wide">
              智能微蹲與協調復健系統
            </p>
          </div>
        </div>
        
        <div className="p-8 sm:p-10 space-y-8 bg-amber-50/30">
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed text-center font-medium max-w-xl mx-auto">
            專為長者設計的音樂互動復健體驗。透過踏墊感知與視覺提示，在經典懷舊金曲的陪伴下，完成下肢肌力與平衡訓練。
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <div className="bg-amber-100 p-3 rounded-full text-amber-700">
                <Wifi size={28} />
              </div>
              <h3 className="font-bold text-stone-800">智能地墊連線</h3>
              <p className="text-xs text-stone-500">藍牙無縫連接，精準感知雙腳踩踏與重心轉移</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
                <Activity size={28} />
              </div>
              <h3 className="font-bold text-stone-800">多期復健模式</h3>
              <p className="text-xs text-stone-500">肌少症、中風踏步、骨質疏鬆微蹲，多元化情境設定</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center gap-3">
              <div className="bg-rose-100 p-3 rounded-full text-rose-700">
                <ShieldAlert size={28} />
              </div>
              <h3 className="font-bold text-stone-800">量化指標追蹤</h3>
              <p className="text-xs text-stone-500">包含 GSI 步態對稱性與反應時間，成效一目了然</p>
            </div>
          </div>
          
          <div className="pt-6">
            <button 
              onClick={onNext}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-2xl text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-amber-900/20"
            >
              進入系統設定 <Play fill="currentColor" size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
