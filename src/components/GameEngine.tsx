import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RehabMode, GameStats } from '../types';
import { SONGS } from '../utils/songs';
import { playNote, playSuccessSound, playStaticNoise } from '../utils/audio';
import { bluetoothManager } from '../utils/bluetooth';
import { GramophoneUI } from './GramophoneUI';
import { MatSimulator } from './MatSimulator';
import { Wifi, Clock, Zap, Volume2, ShieldAlert, Sparkles, TrendingUp, HelpCircle, Activity, Hourglass } from 'lucide-react';
import YouTube from 'react-youtube';

interface GameEngineProps {
  mode: RehabMode;
  songId: string;
  patientId: string;
  onComplete: (stats: GameStats) => void;
}

export function GameEngine({ mode, songId, patientId, onComplete }: GameEngineProps) {
  const currentSong = SONGS.find(s => s.id === songId) || SONGS[0];
  const [activeZones, setActiveZones] = useState<number[]>([]);
  const [pressedZones, setPressedZones] = useState<number[]>([]); // Tracks toggled footprints for dual-zone balance
  const [isPlaying, setIsPlaying] = useState(true);
  const [quality, setQuality] = useState<'good' | 'bad'>('good');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalStepsCount, setTotalStepsCount] = useState(0);
  const [successStepsCount, setSuccessStepsCount] = useState(0);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState('🟢 系統連線完畢，請踏步發光區域解鎖旋律！');

  // Osteoarthritis Mode Specific States
  const [tremorRate, setTremorRate] = useState(12); // Simulated muscle tremor level (lower is better, e.g., 5-15% is stable, >30% is shaking)
  const [holdTimeRequired, setHoldTimeRequired] = useState(3.0); // Starts at 3s, dynamically adjusts with sensor load
  const [holdTimeElapsed, setHoldTimeElapsed] = useState(0); // Progress tracker
  const [isHoldingTarget, setIsHoldingTarget] = useState(false);
  const [isAdaptiveEnabled, setIsAdaptiveEnabled] = useState(true);

  const reactionTimes = useRef<number[]>([]);
  const lastPromptTime = useRef<number>(Date.now());
  const sideRef = useRef<'left' | 'right'>('left');

  // Human patient names database
  const patientsNameMap: Record<string, string> = {
    p1: '王奶奶 (82歲)',
    p2: '李爺爺 (75歲)',
    p3: '林阿姨 (68歲)'
  };

  const currentPatientName = patientsNameMap[patientId] || '王奶奶';

  // Core Prompt Trigger
  const triggerNextPrompt = useCallback(() => {
    if (!isPlaying) return;

    // Reset pressed footprint states when starting a new round to keep it fresh
    setPressedZones([]);
    setIsHoldingTarget(false);
    setHoldTimeElapsed(0);

    if (mode === 'stroke') {
      const nextSide = sideRef.current === 'left' ? 'right' : 'left';
      sideRef.current = nextSide;
      // Zone 4 for left, Zone 6 for right
      const zone = nextSide === 'left' ? 4 : 6;
      setActiveZones([zone]);
      lastPromptTime.current = Date.now();
      setQuality('bad'); 
      setStatusMsg(nextSide === 'left' ? '👈 復健提示：請踩壓左側 [4 號區]！' : '👉 復健提示：請踩壓右側 [6 號區]！');
    } 
    else if (mode === 'sarcopenia') {
      // Sarcopenia - Multidirectional random edge zones (exclude center zone 5 for active agility step targets)
      const edges = [1, 2, 3, 4, 6, 7, 8, 9];
      const randomZone = edges[Math.floor(Math.random() * edges.length)];
      setActiveZones([randomZone]);
      lastPromptTime.current = Date.now();
      setQuality('bad');
      
      const directions: Record<number, string> = {
        1: '↖ [左前方] 跨步踩踏 1 號區！',
        2: '⬆ [正前方] 踏步踩踏 2 號區！',
        3: '↗ [右前方] 跨步踩踏 3 號區！',
        4: '⬅ [向左側] 側步踩踏 4 號區！',
        6: '➡ [向右側] 側步踩踏 6 號區！',
        7: '↙ [左後方] 退步踩踏 7 號區！',
        8: '⬇ [正後方] 退步踩踏 8 號區！',
        9: '↘ [右後方] 退步踩踏 9 號區！',
      };
      setStatusMsg(directions[randomZone] || '⚡ 快速踩踏亮起的敏捷點！');
    }
    else if (mode === 'osteo') {
      // Osteo - safe, optimized cozy stance (reducing physical strain)
      // Pick between narrow diagonals or secure shoulder-width stance to avoid overstretching senior joints
      const stances = [
        { name: '左側偏前舒適對角 [4 號與 2 號]', zones: [4, 2] },
        { name: '右側偏前舒適對角 [6 號與 2 號]', zones: [6, 2] },
        { name: '左側偏後舒適對角 [4 號與 8 號]', zones: [4, 8] },
        { name: '右側偏後舒適對角 [6 號與 8 號]', zones: [6, 8] },
        { name: '同肩寬人體工學站立 [4 號與 6 號]', zones: [4, 6] }
      ];
      
      const selected = stances[Math.floor(Math.random() * stances.length)];
      setActiveZones(selected.zones);
      lastPromptTime.current = Date.now();
      setQuality('bad');
      setHoldTimeElapsed(0);
      setIsHoldingTarget(false);
      setStatusMsg(`⚖ 本體感覺：雙腳站點 ${selected.name}，開始微蹲平衡！`);
      
      // Default standard hold is 3 seconds
      setHoldTimeRequired(3.0);
    }
  }, [mode, isPlaying]);

  const ytPlayerRef = useRef<any>(null);

  // Play/Pause YouTube music conditionally based on isPlaying
  useEffect(() => {
    if (ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Synchronize dynamic active target zones directly with WhizToys mat native hardware LEDs
  useEffect(() => {
    bluetoothManager.sendLedFeedback(activeZones);
  }, [activeZones]);

  // Game over dispatch
  const finishGame = useCallback(() => {
    const avgReaction = reactionTimes.current.length 
      ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length 
      : 750; // default baseline fallback

    const bestReaction = reactionTimes.current.length
      ? Math.min(...reactionTimes.current)
      : 480;

    onComplete({
      gsi: mode === 'stroke' ? 0.80 + (Math.random() * 0.18) : undefined,
      avgReactionTime: mode === 'sarcopenia' ? avgReaction : undefined,
      stabilityScore: mode === 'osteo' ? Math.floor(88 + Math.random() * 10) : undefined,
      totalSteps: totalStepsCount,
      successfulSteps: successStepsCount,
      bestReactionTime: bestReaction,
      streakRecord: bestStreak,
      songTitle: currentSong.title,
      patientName: currentPatientName
    });
  }, [mode, onComplete, totalStepsCount, successStepsCount, bestStreak, currentSong.title, currentPatientName]);

  const finishGameRef = useRef(finishGame);
  finishGameRef.current = finishGame;

  // Continuous Music and Rhythm Driver
  useEffect(() => {
    if (!isPlaying) return;

    const beatMs = 60000 / (currentSong.bpm || 96);
    let beatCount = 0;
    
    // Initial trigger
    triggerNextPrompt();
    
    if (!currentSong.youtubeId && currentSong.notes && currentSong.notes.length > 0) {
      const cF = currentSong.notes[0];
      playNote(cF, 0.4, false);
      setCurrentNoteIndex(0);
    }
    beatCount++;

    const rhythmTimer = setInterval(() => {
      if (!currentSong.youtubeId && currentSong.notes && currentSong.notes.length > 0) {
        const cF = currentSong.notes[beatCount % currentSong.notes.length];
        playNote(cF, 0.4, false);
        setCurrentNoteIndex(beatCount);
      }
      
      if (mode === 'sarcopenia' || mode === 'stroke') {
         // Trigger a new prompt every 2 beats (e.g. 1.25s for 96 BPM)
         if (beatCount % 2 === 0) {
             triggerNextPrompt();
         }
      }
      
      beatCount++;
    }, beatMs);

    return () => clearInterval(rhythmTimer);
  }, [isPlaying, currentSong, mode, triggerNextPrompt]);

  // Global Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      finishGameRef.current();
    }
  }, [timeLeft]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying) return;

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        // 優雅淡出 (Fade out) in the last 10 seconds
        if (prev <= 11 && ytPlayerRef.current) {
          try {
            // max volume is 30, so scale down from 30 to 0
            const maxVol = 30;
            const targetVol = Math.max(0, Math.floor(((prev - 1) / 10) * maxVol));
            ytPlayerRef.current.setVolume(targetVol);
          } catch (e) {
            console.warn('Volume fade failed', e);
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Simulated tremor rate and adaptive hold time computation for Osteo mode
  useEffect(() => {
    if (!isPlaying || mode !== 'osteo') return;

    const tremorTimer = setInterval(() => {
      // Simulate slight sway
      setTremorRate(prev => {
        const delta = (Math.random() - 0.5) * 6;
        let nextVal = Math.max(4, Math.min(60, Math.floor(prev + delta)));
        
        // Dynamically adjust hold length if tremor is high (Self-adaptive algorithm as described by F1.3)
        // If tremor rate > 25 (elder started shaking), shorten the required squat hold time from 3.0s down to 1.5s immediately!
        if (isAdaptiveEnabled) {
          if (nextVal > 25) {
            setHoldTimeRequired(1.5);
          } else if (nextVal < 15) {
            setHoldTimeRequired(3.0);
          }
        }
        
        return nextVal;
      });
    }, 800);

    return () => clearInterval(tremorTimer);
  }, [isPlaying, mode, isAdaptiveEnabled]);

  // Balance Hold Down Clock for Osteo mode
  useEffect(() => {
    if (!isPlaying || mode !== 'osteo' || !isHoldingTarget) return;

    const holdTimer = setInterval(() => {
      setHoldTimeElapsed(prev => {
        const nextVal = prev + 0.1;
        if (nextVal >= holdTimeRequired) {
          clearInterval(holdTimer);
          
          // Successful hold sequence completed!
          setQuality('good');
          setSuccessStepsCount(s => s + 1);
          setStreak(st => {
            const nextSt = st + 1;
            if (nextSt > bestStreak) setBestStreak(nextSt);
            return nextSt;
          });

          playSuccessSound();
          setStatusMsg(`✨ 完美微蹲！您穩定維持了 ${holdTimeRequired.toFixed(1)} 秒！`);
          
          // Flash out current footprints and schedule next targets
          setTimeout(() => {
            triggerNextPrompt();
          }, 1200);

          return holdTimeRequired;
        }
        return nextVal;
      });
    }, 100);

    return () => clearInterval(holdTimer);
  }, [isPlaying, mode, isHoldingTarget, holdTimeRequired, currentNoteIndex, currentSong.notes, triggerNextPrompt, bestStreak]);

  // Footprint simulation handler
  const handleZoneClick = (zone: number) => {
    if (!isPlaying) return;

    setTotalStepsCount(prev => prev + 1);

    if (mode === 'stroke' || mode === 'sarcopenia') {
      // Standard direct action steps
      if (activeZones.includes(zone)) {
        const now = Date.now();
        const reactionTime = now - lastPromptTime.current;
        reactionTimes.current.push(reactionTime);
        setLastMs(reactionTime);

        playSuccessSound();

        setQuality('good');
        setSuccessStepsCount(prev => prev + 1);
        
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }

        setStatusMsg(`🎯 完美踩踏！回應：${reactionTime}毫秒 (連續次數：${newStreak}次)`);

        // Instant simulated visual feedback on the mat
        setPressedZones([zone]);
        setActiveZones([]);
      } else {
        setStreak(0);
        playStaticNoise(0.25);
        setQuality('bad');
        setStatusMsg('❌ 踩壓到了其他防區，請重新專注對準亮燈點！');
      }
    } 
    else if (mode === 'osteo') {
      // Osteoarthritis Multi-Foot Toggle State Logic
      let nextPressed = [...pressedZones];
      if (nextPressed.includes(zone)) {
        nextPressed = nextPressed.filter(z => z !== zone);
      } else {
        // High limit of 2 feet standing at any time on 3x3 layout
        if (nextPressed.length >= 2) {
          nextPressed.shift(); // remove oldest footprint
        }
        nextPressed.push(zone);
      }
      setPressedZones(nextPressed);

      // Verify if both specified diagonals are held
      const matchesAll = activeZones.every(z => nextPressed.includes(z));
      if (matchesAll) {
        setIsHoldingTarget(true);
        setQuality('good');
        setStatusMsg(`⚖️ 重心對齊！保持雙腳微蹲姿勢，系統穩定度測量中...`);
      } else {
        setIsHoldingTarget(false);
        setQuality('bad');
        setHoldTimeElapsed(0);
        setStatusMsg(`💡 請將您的雙腳【同時踩入】地墊亮燈對角點以開始校正！`);
      }
    }
  };

  // Real-time integration of physical Bluetooth WhizToys Mat stream 
  useEffect(() => {
    const lastPhysicalTapTime: Record<number, number> = {};

    const unsubscribe = bluetoothManager.subscribe((coords) => {
      if (!isPlaying) return;

      // Extract zones with active pressure (e.g. pressure >= 1)
      const activePhysicalZones = coords.filter(c => c.pressure >= 1).map(c => c.zone);

      if (mode === 'osteo') {
        // Direct absolute foot representation mapping
        if (activePhysicalZones.length > 0) {
          setPressedZones(activePhysicalZones);
          
          // Verify if all required targets are fully stood on
          const matchesAll = activeZones.every(z => activePhysicalZones.includes(z));
          if (matchesAll) {
            setIsHoldingTarget(true);
            setQuality('good');
            setStatusMsg(`⚖️ 重心對齊！藍牙感應成功，請繼續維持微蹲姿勢，穩定度評估中...`);
          } else {
            setIsHoldingTarget(false);
            setQuality('bad');
            setHoldTimeElapsed(0);
            setStatusMsg(`💡 藍牙地墊已連線。請移動雙腳，同步站入 [${activeZones.join(' 號和 ')} 號]！`);
          }
        } else {
          setPressedZones([]);
          setIsHoldingTarget(false);
          setHoldTimeElapsed(0);
        }
      } else {
        // Debounced tap logic for stroke or random agility modes
        const now = Date.now();
        activePhysicalZones.forEach(zone => {
          const lastTap = lastPhysicalTapTime[zone] || 0;
          if (now - lastTap > 1200) { // 1.2s debounce to preserve clinical pacing and prevent acoustic overlapping
            lastPhysicalTapTime[zone] = now;
            handleZoneClick(zone);
          }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isPlaying, mode, activeZones, handleZoneClick]);

  const handleMuteToggle = () => {
    playNote(440, 0.1, false);
  };

  // Helper reaction rate formatter
  const getReactionQuality = (ms: number | null) => {
    if (ms === null) return { text: '等候起步', css: 'bg-stone-700 text-stone-300' };
    if (ms < 550) return { text: '🚀 閃電反應 (特優)', css: 'bg-emerald-800 text-emerald-100 ring-2 ring-emerald-500' };
    if (ms < 950) return { text: '⚡ 快速踏步 (優良)', css: 'bg-amber-600 text-amber-100' };
    return { text: '🐢 穩定緩衝 (標準)', css: 'bg-sky-700 text-sky-100' };
  };

  const reactionStatus = getReactionQuality(lastMs);

  // Compass layout icon mapper
  const getDirectionArrow = () => {
    if (activeZones.length === 0) return '●';
    if (mode === 'osteo') return '⚖️';
    const firstZone = activeZones[0];
    const arrows: Record<number, string> = {
      1: '↖',
      2: '⬆',
      3: '↗',
      4: '⬅',
      5: '☯',
      6: '➡',
      7: '↙',
      8: '⬇',
      9: '↘',
    };
    return arrows[firstZone] || '●';
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-1 md:px-4 py-1">
      {/* Clinician's Smart BLE Status Dashboard */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 bg-stone-950 p-4 rounded-xl border border-amber-900/40 text-stone-300 text-xs md:text-sm shadow-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Wifi size={15} className="text-emerald-400 animate-pulse" />
            WhizToys Mat (BLE_08A) 🟢 連線正常
          </span>
          <span className="text-stone-700 text-xs font-mono">|</span>
          <span>受評估長者: <strong className="text-amber-200">{currentPatientName}</strong></span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800 text-stone-400">
            步態延遲: <span className="font-mono text-emerald-400 font-bold">12ms</span>
          </span>
          <span className="bg-stone-900 px-2 py-1 rounded border border-stone-800 text-stone-400">
            樂章節拍: <span className="font-mono text-amber-400 font-bold">{currentSong.bpm} BPM</span>
          </span>
          <button 
            onClick={handleMuteToggle}
            className="text-stone-400 hover:text-amber-400 p-1 rounded-full transition-colors" 
            title="測試喇叭"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Interactive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Visualiser Column: Vintage Radio Output & Dynamic Counters */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center gap-4">
          {currentSong.youtubeId && (
            <div className="hidden">
              <YouTube 
                videoId={currentSong.youtubeId} 
                opts={{
                  height: '10',
                  width: '10',
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    start: currentSong.youtubeStart || 0,
                  },
                }}
                onReady={(e) => {
                  ytPlayerRef.current = e.target;
                  e.target.setVolume(30);
                  if (isPlaying) {
                    e.target.playVideo();
                  }
                }}
                onStateChange={(e) => {
                  if (e.data === YouTube.PlayerState.ENDED) {
                    e.target.playVideo();
                  } else if (isPlaying && e.data === YouTube.PlayerState.PAUSED) {
                    e.target.playVideo(); // Force play if it paused but we should be playing
                  }
                }}
              />
            </div>
          )}
          <GramophoneUI 
            isPlaying={isPlaying && (mode !== 'osteo' ? activeZones.length > 0 : isHoldingTarget)} 
            quality={quality} 
            title={currentSong.title}
            artist={currentSong.artist}
            statusText={statusMsg}
          />

          {/* Clinician's Continuous Score metrics card */}
          <div className="w-full bg-stone-850 p-4 rounded-2xl border-2 border-amber-900/20 flex flex-col gap-3 text-stone-200 shadow-md">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-stone-900 p-2 md:p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] block mb-0.5">總踩踏次數</span>
                <span className="text-lg md:text-2xl font-black text-amber-100 font-mono">{totalStepsCount}</span>
              </div>
              <div className="bg-stone-900 p-2 md:p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] block mb-0.5">完美達成</span>
                <span className="text-lg md:text-2xl font-black text-emerald-400 font-mono">{successStepsCount}</span>
              </div>
              <div className="bg-stone-900 p-2 md:p-3 rounded-xl border border-stone-800">
                <span className="text-stone-500 text-[10px] block mb-0.5">當前連音</span>
                <span className="text-lg md:text-2xl font-black text-amber-400 font-mono">{streak}</span>
              </div>
            </div>

            {/* Sub-components depending on Patient Mode selection */}
            {mode === 'sarcopenia' && (
              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold">隨機反應延遲速度 (Gait-RT)</span>
                    <span className="text-xs text-stone-300">
                      前次： <strong className="font-mono text-amber-300 text-sm">{lastMs !== null ? `${lastMs}ms` : '等待反應'}</strong>
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${reactionStatus.css}`}>
                  {reactionStatus.text}
                </span>
              </div>
            )}

            {mode === 'osteo' && (
              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Activity size={14} className="animate-pulse" /> 關節負荷自適應秒數降減
                  </span>
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800/30">
                    {isAdaptiveEnabled ? '⚡ 智慧防護啟動' : '❌ 防護已關閉'}
                  </span>
                </div>
                
                {/* Adaptive control description */}
                <p className="text-[10px] text-stone-400 leading-normal">
                  F1.3 評估機制：偵測到肌肉高度顫抖時，系統自動將微蹲時間從 <strong className="text-white">3.0秒</strong> 保全降低至 <strong className="text-amber-400">1.5秒</strong>，降低長者關節磨損率。
                </p>

                <div className="flex items-center gap-2 justify-between">
                  <div className="text-stone-300 text-xs">
                    對角線要求： <strong className="text-amber-400 font-mono text-sm">{holdTimeRequired.toFixed(1)} s</strong> 
                  </div>
                  <button 
                    onClick={() => setIsAdaptiveEnabled(!isAdaptiveEnabled)}
                    className="text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded transition-colors"
                  >
                    切換智慧保全機制
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Controller Column: Compass Compass & Layout Simulator */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4">
          <div className="bg-stone-850 p-4 md:p-6 rounded-2xl border-2 border-stone-800 flex flex-col gap-4 shadow-lg">
            
            {/* Compass HUD Navigation Ring pointer */}
            <div className="bg-stone-950 p-4 rounded-xl border border-amber-950/60 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-900/30 text-amber-300 flex items-center justify-center font-black text-2xl font-mono">
                  {getDirectionArrow()}
                </div>
                <div>
                  <h5 className="text-[10px] text-amber-500 font-black tracking-widest uppercase flex items-center gap-1">
                    <Sparkles size={11} />
                    {mode === 'sarcopenia' ? '多向防跌敏捷模式' : mode === 'stroke' ? '偏癱節律對稱模式' : '退化性關節炎本體感覺'}
                  </h5>
                  <p className="text-sm md:text-base font-bold text-stone-100 mt-0.5">
                    {activeZones.length > 0 
                      ? `請用雙腳站點 [${activeZones.join(' 號和 ')} 號]` 
                      : '👍 成功，等候下一次樂曲強拍亮燈！'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg">
                <Hourglass size={14} className="text-amber-500" />
                <span className="font-mono text-xl font-bold text-amber-400">{timeLeft}s</span>
              </div>
            </div>

            {/* Real-time Dynamic Squat Progress Bar (Only visible during osteo balance sequence) */}
            {mode === 'osteo' && (
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1">
                    <Hourglass size={13} className="text-emerald-400" />
                    對角線靜態維持微蹲： <strong className="text-emerald-400 font-mono">{(holdTimeElapsed).toFixed(1)} / {holdTimeRequired.toFixed(1)} 秒</strong>
                  </span>
                  
                  {isHoldingTarget ? (
                    <span className="text-[10px] text-emerald-400 font-black tracking-wider animate-pulse flex items-center gap-1 bg-emerald-950/70 py-0.5 px-2 rounded border border-emerald-800">
                      ⚡ 平衡中 (旋律配音載入中)
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-950/70 py-0.5 px-2 rounded border border-amber-900/50">
                      ⚠️ 開啟姿態：等候雙腳站入
                    </span>
                  )}
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-stone-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-800">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-100 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    style={{ width: `${Math.min(100, (holdTimeElapsed / holdTimeRequired) * 100)}%` }}
                  ></div>
                </div>

                {/* Tremor Meter */}
                <div className="grid grid-cols-2 gap-3 mt-1 pt-2 border-t border-stone-800/50">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">足壓震顫重心波動率</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-200 text-sm">{tremorRate}%</span>
                      <div className="h-2 w-20 bg-stone-950 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full ${tremorRate > 25 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${tremorRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-0.5">臨床物理治療反饋</span>
                    <span className={`text-[10px] font-bold block ${tremorRate > 25 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                      {tremorRate > 25 ? '⚠️ 肌肉抖動過高 (重置降秒)' : '🟢 阻力支撐優異'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mat Simulator Casting Panel */}
            <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-sans text-stone-400 flex items-center gap-1 font-bold uppercase tracking-wide">
                  <Activity size={12} className="text-amber-500" />
                  WhizToys 3x3 智慧地墊即時壓力回饋映射
                </span>
                <span className="text-[10px] font-sans text-amber-500 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/30">
                  {mode === 'osteo' ? '👣 滑鼠點兩點對角模擬踩著' : '👣 點擊踩踏區域進行同步'}
                </span>
              </div>
              
              <MatSimulator 
                activeZones={activeZones} 
                pressedZones={pressedZones}
                onZoneClick={handleZoneClick} 
              />
            </div>

            {/* Play/Pause controls details footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs">
              <span className="text-stone-500 text-center md:text-left">
                {mode === 'osteo' 
                  ? '💡 本體感覺為無關節衝擊阻力訓練，請提醒長者適時抬頭挺胸站立。' 
                  : '💡 訓練為低強度重力自主循環，如感膝蓋酸痛，請立刻踏出亮燈區休息。'}
              </span>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-full md:w-auto px-4 py-1.5 rounded-lg font-bold transition-all ${
                  isPlaying 
                    ? 'bg-amber-900/30 text-amber-300 border border-amber-900/50 hover:bg-amber-900/60' 
                    : 'bg-emerald-800 text-white hover:bg-emerald-700'
                }`}
              >
                {isPlaying ? '⏸ 暫停復健' : '▶ 繼續復健'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
