import React from 'react';
import { motion } from 'motion/react';

interface MatSimulatorProps {
  activeZones: number[];
  pressedZones?: number[];
  onZoneClick: (zone: number) => void;
  onZoneRelease?: (zone: number) => void;
}

export function MatSimulator({ activeZones, pressedZones = [], onZoneClick, onZoneRelease }: MatSimulatorProps) {
  // Zones 1 to 9
  const zones = Array.from({ length: 9 }, (_, i) => i + 1);

  // Helper to get foot label based on WhizToys mat geography
  const getFootLabel = (zone: number) => {
    if ([1, 4, 7].includes(zone)) return '👣 拔河 (左)';
    if ([3, 6, 9].includes(zone)) return '👣 拔河 (右)';
    return '👣 (中)';
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-stone-800 rounded-xl max-w-md mx-auto aspect-square w-full shadow-inner border-4 border-stone-900">
      {zones.map(zone => {
        const isActiveTarget = activeZones.includes(zone);
        const isCurrentlyPressed = pressedZones.includes(zone);
        
        return (
          <motion.div
            key={zone}
            whileTap={{ scale: 0.95 }}
            onClick={() => onZoneClick(zone)}
            onMouseDown={() => !onZoneRelease && onZoneClick(zone)}
            onMouseUp={() => onZoneRelease?.(zone)}
            className={`
              relative rounded-xl border-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none h-full aspect-square
              ${isCurrentlyPressed && isActiveTarget
                ? 'bg-emerald-500 border-white text-white shadow-[0_0_20px_rgba(16,185,129,0.9)] scale-[0.98]'
                : isCurrentlyPressed
                ? 'bg-stone-600 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                : isActiveTarget 
                ? 'bg-amber-400 border-amber-200 text-amber-950 font-black shadow-[0_0_18px_rgba(251,191,36,0.85)] animate-pulse' 
                : 'bg-stone-700 border-stone-600 hover:border-stone-500 hover:bg-stone-650 text-stone-400'}
            `}
          >
            <span className="text-2xl font-black font-mono absolute top-2 left-3">{zone}</span>
            
            {/* Visual footprint indicator */}
            <div className="flex flex-col items-center justify-center mt-3">
              {isCurrentlyPressed ? (
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-base md:text-sm font-bold flex flex-col items-center gap-0.5 text-center"
                >
                  <span className="text-2xl md:text-3xl">👣</span>
                  <span className="bg-emerald-950/80 text-[9px] px-1.5 py-0.5 rounded text-emerald-300 font-sans tracking-tighter">
                    已踩入
                  </span>
                </motion.div>
              ) : isActiveTarget ? (
                <div className="text-center animate-bounce mt-2">
                  <span className="text-amber-950 font-black text-xs block py-0.5 px-1 bg-amber-200/80 rounded tracking-tighter shadow-xs">
                    請踩這！
                  </span>
                </div>
              ) : (
                <div className="h-6"></div>
              )}
            </div>

            {/* Micro aesthetic overlay */}
            {isActiveTarget && !isCurrentlyPressed && (
              <motion.div
                className="absolute inset-0 bg-amber-300 opacity-20 rounded-lg pointer-events-none"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
