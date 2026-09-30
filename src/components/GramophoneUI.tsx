import React from 'react';
import { motion } from 'motion/react';
import { Disc, Music } from 'lucide-react';

interface GramophoneProps {
  isPlaying: boolean;
  quality: 'good' | 'bad';
  title: string;
  artist: string;
  statusText?: string;
}

export function GramophoneUI({ isPlaying, quality, title, artist, statusText }: GramophoneProps) {
  return (
    <div className="bg-amber-950/70 p-6 rounded-2xl border-4 border-amber-800/80 flex flex-col items-center w-full max-w-sm shadow-xl relative overflow-hidden">
      {/* Wooden texture design effect in CSS */}
      <div className="absolute inset-0 opacity-10 bg-radial from-transparent to-stone-900 pointer-events-none"></div>

      <div className="text-amber-200 font-serif text-lg md:text-xl mb-4 flex items-center gap-2 font-bold tracking-wide z-10">
        <Disc size={20} className={`${isPlaying ? 'animate-spin' : ''} text-amber-400`} />
        復古唱片留聲機
      </div>
      
      <div className="relative z-10 flex justify-center py-2 h-52">
         {/* Vinyl Base */}
         <div className="w-48 h-48 bg-stone-950 rounded-full border-4 border-amber-900 flex items-center justify-center overflow-hidden shadow-2xl relative">
            <motion.div 
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className={`w-full h-full rounded-full border-[12px] border-black flex items-center justify-center relative transition-all duration-500
                  ${quality === 'bad' ? 'opacity-70 contrast-125 saturate-50' : ''}
               `}
               style={{ background: 'repeating-radial-gradient(#1a1a1a, #1a1a1a 4px, #262626 5px, #262626 6px)' }}
            >
                {/* LP center sticker */}
                <div className="w-16 h-16 bg-amber-500 rounded-full border-4 border-amber-800 flex items-center justify-center shadow-inner relative">
                   <div className="text-[9px] font-black font-sans text-amber-950 text-center tracking-tighter leading-3 max-w-[48px] overflow-hidden whitespace-nowrap">
                     {title}
                   </div>
                   <div className="w-1.5 h-1.5 bg-black rounded-full absolute bottom-1"></div>
                </div>
            </motion.div>
         </div>

         {/* Mechanical Stylus arm */}
         <motion.div 
            className="absolute top-2 right-4 w-3 h-24 bg-gradient-to-b from-stone-400 to-zinc-200 origin-top rounded-full shadow-lg z-20 cursor-pointer"
            animate={{ rotate: isPlaying ? 28 : 8 }}
            transition={{ type: "spring", stiffness: 60 }}
         >
           {/* Stylus needle head */}
           <div className="absolute bottom-0 right-0 w-4 h-6 bg-zinc-600 rounded-sm transform translate-x-1 origin-top"></div>
         </motion.div>
      </div>

      <div className="mt-4 text-center h-20 flex flex-col justify-center w-full z-10 bg-black/30 p-2 rounded-lg border border-amber-950/40">
         <h4 className="text-amber-100 font-bold text-lg font-serif tracking-widest flex items-center justify-center gap-1.5">
           <Music size={14} className="text-amber-400 animate-bounce" />
           {title} <span className="text-xs text-amber-300 font-normal font-sans">({artist})</span>
         </h4>
         <p className={`text-xs md:text-sm mt-1 transition-colors font-medium ${quality === 'good' ? 'text-emerald-400 font-bold text-shadow-sm' : 'text-amber-400 animate-pulse'}`}>
           {statusText || (quality === 'good' ? '✨ 節奏完美 懷舊金曲播放中' : '🔈 踏步訊號正常，等待下一步')}
         </p>
      </div>
    </div>
  );
}
