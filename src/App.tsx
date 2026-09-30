import React, { useState } from 'react';
import { IntroView } from './components/IntroView';
import { SetupView } from './components/SetupView';
import { CalibrationView } from './components/CalibrationView';
import { GameEngine } from './components/GameEngine';
import { ResultView } from './components/ResultView';
import { BluetoothStatus } from './components/BluetoothStatus';
import { AppState, RehabMode, GameStats } from './types';
import { Radio } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'intro',
    selectedPatientId: null,
    selectedMode: null,
    selectedSongId: 'yelaixiang',
    gsiThreshold: 0.90, // default strict
    stats: null
  });

  const handleIntroNext = () => {
    setState({ ...state, view: 'setup' });
  };

  const handleStart = (patientId: string, mode: RehabMode, songId: string, gsiThreshold: number = 0.90) => {
    setState({ 
      ...state, 
      view: 'calibration', 
      selectedPatientId: patientId, 
      selectedMode: mode, 
      selectedSongId: songId,
      gsiThreshold
    });
  };

  const handleCalibrationComplete = () => {
    setState({ ...state, view: 'game' });
  };

  const handleGameComplete = (stats: GameStats) => {
    setState({ ...state, view: 'result', stats });
  };

  const handleRestart = () => {
    setState({ view: 'intro', selectedPatientId: null, selectedMode: null, selectedSongId: 'yelaixiang', gsiThreshold: 0.90, stats: null });
  };

  return (
    <div className="min-h-screen bg-stone-900 font-sans selection:bg-amber-500 selection:text-white overflow-y-auto pb-12">
       {/* Background decorative styling */}
       <div className="fixed inset-0 pointer-events-none" style={{
           background: 'radial-gradient(circle at 50% 0%, #3e261a 0%, #171514 100%)',
       }}></div>

       <div className="relative z-10 w-full h-full flex flex-col items-center p-4 md:p-6 lg:p-8">
         <div className="w-full max-w-4xl mx-auto">
           {/* Global Professional Clinical Navbar */}
           <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-stone-800/60">
             <div className="flex items-center gap-2">
               <div className="bg-amber-600/30 text-amber-400 p-2 rounded-xl border border-amber-600/20">
                 <Radio size={20} className="animate-pulse" />
               </div>
               <div>
                 <span className="text-stone-300 font-bold tracking-tight text-sm block">時光留聲機 WhizToys Hub</span>
                 <span className="text-[10px] text-stone-500 block -mt-0.5 uppercase tracking-widest font-semibold">智慧臨床評估終端</span>
               </div>
             </div>
             
             {/* Global Mat Bluetooth Controller */}
             <BluetoothStatus />
           </div>

           {state.view === 'intro' && <IntroView onNext={handleIntroNext} />}
           {state.view === 'setup' && <SetupView onStart={handleStart} />}
           {state.view === 'calibration' && <CalibrationView onComplete={handleCalibrationComplete} />}
           {state.view === 'game' && state.selectedMode && (
             <GameEngine 
               mode={state.selectedMode} 
               songId={state.selectedSongId}
               patientId={state.selectedPatientId || 'p1'}
               onComplete={handleGameComplete} 
             />
           )}
           {state.view === 'result' && state.stats && (
             <ResultView stats={state.stats} onRestart={handleRestart} gsiThreshold={state.gsiThreshold || 0.90} />
           )}
         </div>
       </div>
    </div>
  );
}

