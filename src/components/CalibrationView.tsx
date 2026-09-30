import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Footprints } from 'lucide-react';

export function CalibrationView({ onComplete }: { onComplete: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
    }
  }, [countdown, onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 max-w-xl mx-auto">
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-32 h-32 bg-amber-800 rounded-full flex items-center justify-center mb-10 border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
      >
        <Footprints size={56} className="text-amber-100" />
      </motion.div>
      <h2 className="text-4xl font-bold text-amber-100 mb-6 font-serif tracking-wide">重心基準校正中...</h2>
      <p className="text-xl text-amber-200/80 mb-12 max-w-md leading-relaxed">
        請長者雙腳自然站立於地墊中央，系統正在測量基準重心線與底噪。
      </p>
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-stone-800" />
            <motion.circle 
                cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                className="text-amber-500"
                initial={{ strokeDasharray: 377, strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -377 }}
                transition={{ duration: 5, ease: "linear" }}
            />
        </svg>
        <div className="absolute text-5xl font-black text-amber-400 font-mono">
          {countdown}
        </div>
      </div>
    </div>
  );
}
