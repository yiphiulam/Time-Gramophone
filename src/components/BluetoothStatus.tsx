import React, { useEffect, useState } from 'react';
import { bluetoothManager, BluetoothState } from '../utils/bluetooth';
import { Bluetooth, Activity, Power, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function BluetoothStatus() {
  const [state, setState] = useState<BluetoothState>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    bluetoothManager.registerStateListener((newState) => {
      setState(newState);
      if (newState === 'error') {
        setErrorMsg(bluetoothManager.getLastError());
      } else {
        setErrorMsg(null);
      }
    });
  }, []);

  const handleConnect = async () => {
    try {
      setErrorMsg(null);
      await bluetoothManager.connect();
    } catch (err: any) {
      console.warn('Bluetooth pairing action canceled or failed:', err);
    }
  };

  const handleDisconnect = async () => {
    await bluetoothManager.disconnect();
  };

  const getStatusConfig = () => {
    switch (state) {
      case 'connected':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300',
          indicator: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          text: 'WTS2 已連線',
          iconColor: 'text-emerald-400'
        };
      case 'connecting':
        return {
          bg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
          indicator: 'bg-amber-500 animate-ping',
          text: '搜尋 WTS2 中...',
          iconColor: 'text-amber-400'
        };
      case 'error':
        return {
          bg: 'bg-rose-950/80 border-rose-900/60 text-rose-300',
          indicator: 'bg-rose-500',
          text: '連線阻礙',
          iconColor: 'text-rose-400'
        };
      case 'disconnected':
      default:
        return {
          bg: 'bg-stone-900/90 border-stone-800 text-stone-300',
          indicator: 'bg-stone-500',
          text: '連接藍牙地墊 WTS2',
          iconColor: 'text-stone-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="relative font-sans z-50">
      {/* Outer Connection Pill Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (state === 'connected') {
            setShowDropdown(!showDropdown);
          } else {
            handleConnect();
          }
        }}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs md:text-sm font-bold shadow-md cursor-pointer transition-colors ${config.bg}`}
      >
        <Bluetooth size={16} className={`${state === 'connecting' ? 'animate-pulse' : ''} ${config.iconColor}`} />
        
        <span>{config.text}</span>
        
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.indicator}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.indicator}`}></span>
        </span>
      </motion.button>

      {/* Connection Info Dropdown */}
      <AnimatePresence>
        {(showDropdown && state === 'connected') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-64 bg-stone-950 rounded-xl border border-stone-800 shadow-2xl p-4 text-stone-300 text-xs flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <strong className="text-stone-100 font-bold">步態硬體連線狀態</strong>
            </div>

            <div className="space-y-1 text-[11px] leading-relaxed">
              <div className="flex justify-between">
                <span>設備型號：</span>
                <span className="font-mono text-emerald-400 font-bold">WhizToys Smart Mat (WTS2)</span>
              </div>
              <div className="flex justify-between">
                <span>主動服務 (UUID)：</span>
                <span className="font-mono text-stone-500">0000fee0...</span>
              </div>
              <div className="flex justify-between">
                <span>傳輸延遲：</span>
                <span className="font-mono text-emerald-400">10 ~ 15 ms</span>
              </div>
              <div className="flex justify-between">
                <span>校正狀態：</span>
                <span className="text-emerald-400 font-semibold">良好 (自動適應)</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleDisconnect();
                setShowDropdown(false);
              }}
              className="mt-1 w-full bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 py-1.5 rounded-lg font-bold border border-rose-900/50 flex items-center justify-center gap-1.5 pointer-events-auto transition-colors"
            >
              <Power size={12} /> 拔除並斷開設備
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser Web Bluetooth Support Notice overlay */}
      <AnimatePresence>
        {state === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-rose-950 to-stone-950 rounded-xl border border-rose-900 p-4 text-rose-300 text-xs shadow-2xl flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <AlertCircle size={14} className="text-rose-400 shrink-0" />
              <span>藍牙地墊連接失敗</span>
            </div>
            
            <p className="text-[11px] leading-relaxed text-rose-400/90">
              {errorMsg || '請確認電腦/平板已啟用藍牙，且地墊開關處於配對狀態。'}
            </p>

            <div className="flex gap-2 mt-1">
              <button
                onClick={handleConnect}
                className="flex-1 bg-rose-900 hover:bg-rose-800 text-white font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <RefreshCw size={11} /> 重新搜尋 WTS2
              </button>
              <button
                onClick={() => setState('disconnected')}
                className="px-2 bg-stone-900 hover:bg-stone-850 text-stone-400 rounded-md py-1.5 font-bold transition-colors"
              >
                關閉
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
