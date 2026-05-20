import React from 'react';
import { Flame, Sparkles, Sliders, Settings, Play, Square, X, RefreshCw, AlertCircle, Clock, Zap, Volume2, VolumeX } from 'lucide-react';

interface HomeAppProps {
  dailyTargetMinutes: number;
  usedMinutes: number;
  onTargetChange: (val: number) => void;
  onUsedChange: (val: number) => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  flashlightOn: boolean;
  soundMode: 'ring' | 'vibrate' | 'silent';
  onFlashlightChange: (val: boolean) => void;
  onSoundModeChange: (val: 'ring' | 'vibrate' | 'silent') => void;
}

export default function HomeApp({
  dailyTargetMinutes,
  usedMinutes,
  onTargetChange,
  onUsedChange,
  isMonitoring,
  onToggleMonitoring,
  flashlightOn,
  soundMode,
  onFlashlightChange,
  onSoundModeChange
}: HomeAppProps) {
  // Local Calibration Sheet states
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const [draftTargetHrs, setDraftTargetHrs] = React.useState(() => Math.floor(dailyTargetMinutes / 60));
  const [draftTargetMins, setDraftTargetMins] = React.useState(() => dailyTargetMinutes % 60);

  const [draftSpentHrs, setDraftSpentHrs] = React.useState(() => Math.floor(usedMinutes / 60));
  const [draftSpentMins, setDraftSpentMins] = React.useState(() => Math.round(usedMinutes) % 60);

  // Sync internal draft state if parent state undergoes external modification
  React.useEffect(() => {
    setDraftTargetHrs(Math.floor(dailyTargetMinutes / 60));
    setDraftTargetMins(dailyTargetMinutes % 60);
  }, [dailyTargetMinutes]);

  React.useEffect(() => {
    setDraftSpentHrs(Math.floor(usedMinutes / 60));
    setDraftSpentMins(Math.round(usedMinutes) % 60);
  }, [usedMinutes]);

  const handleApplyCalibration = () => {
    const nextTarget = draftTargetHrs * 60 + draftTargetMins;
    const nextSpent = draftSpentHrs * 60 + draftSpentMins;
    
    onTargetChange(nextTarget > 0 ? nextTarget : 1);
    onUsedChange(nextSpent);
    setIsCalibrating(false);
  };

  const remainingMinutes = Math.max(0, dailyTargetMinutes - usedMinutes);
  const progressPercent = Math.min(100, (usedMinutes / dailyTargetMinutes) * 100);

  // Format remaining time nicely with minutes & seconds if it's less than an hour, or hours & minutes
  const formatRemaining = (mins: number) => {
    const totalSecs = Math.round(mins * 60);
    if (totalSecs <= 0) return "0s";
    if (totalSecs < 60) {
      return `${totalSecs}s`;
    }
    if (totalSecs < 3600) {
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      return s > 0 ? `${m}m ${s}s` : `${m}m`;
    } else {
      const h = Math.floor(totalSecs / 3600);
      const m = Math.round((totalSecs % 3600) / 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
  };

  const formatSpent = (mins: number) => {
    const totalSecs = Math.round(mins * 60);
    if (totalSecs <= 0) return "0s";
    if (totalSecs < 60) {
      return `${totalSecs}s`;
    }
    if (totalSecs < 3600) {
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      return s > 0 ? `${m}m ${s}s` : `${m}m`;
    } else {
      const h = Math.floor(totalSecs / 3600);
      const m = Math.round((totalSecs % 3600) / 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] font-sans relative overflow-hidden select-none animate-fade-in text-[#e0e0e0]">
      
      {/* Header Brand */}
      <div className="bg-[#0a0a0a] px-4 py-3 border-b border-white/5 flex justify-between items-center relative z-20">
        <div>
          <span className="text-[8px] text-[#2bcfc1] font-bold uppercase tracking-[0.22em] font-display block">
            Silence & Focus
          </span>
          <h2 className="text-sm font-light text-white tracking-tight mt-0.5">
            ZenLock<span className="text-[#2bcfc1]">.</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Active indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Unlocked</span>
          </div>

          {/* Inline bottom sheet calibration launcher */}
          {!isMonitoring && (
            <button
              id="btn_open_calibration"
              onClick={() => setIsCalibrating(true)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[#888] hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
              title="Calibrate parameters"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2bcfc1]" />
            </button>
          )}
        </div>
      </div>

      {/* Internal Core Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col justify-between space-y-6 pb-12">
        
        {/* Core Circular Gauge of Attention */}
        <div className="flex flex-col items-center bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 shadow-xl relative group">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circular track background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="41"
                className="stroke-white/5 fill-none"
                strokeWidth="4"
              />
              {/* Gauge Progress Bar */}
              <circle
                cx="50"
                cy="50"
                r="41"
                className="stroke-[#2bcfc1] fill-none transition-all duration-300"
                strokeWidth="4"
                strokeDasharray={257.6}
                strokeDashoffset={257.6 - (257.6 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Center Text */}
            <div className="text-center space-y-0.5 z-10">
              <span className="text-[9px] uppercase font-bold text-[#555] tracking-[0.2em] font-display">
                Attention Left
              </span>
              <p className="text-2xl font-light font-display text-white tracking-tight leading-none mt-1">
                {formatRemaining(remainingMinutes)}
              </p>
              <div className="pt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2bcfc1]/80" />
                <span className="text-[10px] text-[#2bcfc1] font-mono tracking-wide">
                  Spent: {formatSpent(usedMinutes)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info text label */}
          <div className="w-full mt-5 bg-[#050505] rounded-xl px-3 py-2 border border-white/5 flex items-center justify-between text-[11px] text-[#777]">
            <span className="tracking-wide">Attention Budget:</span>
            <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {dailyTargetMinutes}m ({Math.floor(dailyTargetMinutes/60)}h {dailyTargetMinutes%60}m)
            </span>
          </div>
        </div>

        {/* Simplistic Active Focus Area */}
        <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 space-y-4 text-center">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Attention Shield Guard
            </h3>
            <p className="text-[10px] text-[#666] leading-relaxed max-w-xs mx-auto">
              {isMonitoring 
                ? "Daily focus tracking is currently ACTIVE. Active screen time is counting up automatically." 
                : "Continuous attention protection is paused. Click start below to activate dynamic focus monitoring."}
            </p>
          </div>

          {/* Prominent minimalist primary button */}
          {isMonitoring ? (
            <div className="w-full py-4 px-3 bg-[#2bcfc1]/5 border border-[#2bcfc1]/20 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-[inset_0_0_12px_rgba(43,207,193,0.05)]">
              <span className="text-[10px] text-[#2bcfc1] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2bcfc1] animate-ping" />
                Focus Shield Active
              </span>
              <span className="text-[8px] text-[#555] uppercase tracking-wider font-mono font-bold">
                Lock Activated • Tracking Real Time
              </span>
            </div>
          ) : (
            <button
              id="btn_toggle_guard_monitoring"
              onClick={onToggleMonitoring}
              className="w-full py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border bg-[#050505] border-white/10 text-white hover:text-[#2bcfc1] hover:border-[#2bcfc1]/40 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current text-[#2bcfc1]" />
              <span>Start Focus Monitoring</span>
            </button>
          )}

          {isMonitoring && (
            <div className="flex items-center justify-center gap-1.5 text-[8px] text-[#2bcfc1] font-mono uppercase tracking-[0.12em] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2bcfc1]" />
              <span>Real-time shield tracking active (+1s/sec)</span>
            </div>
          )}
        </div>

      </div>

      {/* Absolute Bottom Sheet Drawer layout for Calibration & Simulator options */}
      {isCalibrating && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 transition-all duration-300 animate-fade-in flex flex-col justify-end">
          
          {/* Backdrop Closer */}
          <div className="flex-1" onClick={() => setIsCalibrating(false)} />

          {/* Sheet Body Drawer */}
          <div className="bg-[#0a0a0a] border-t border-white/10 rounded-t-[32px] p-5 space-y-4 max-h-[85%] overflow-y-auto animate-[slide-up_0.3s_ease-out_forwards] text-left">
            
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#2bcfc1]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Test Calibration Desk
                </h3>
              </div>
              <button
                id="btn_close_calibration"
                onClick={() => setIsCalibrating(false)}
                className="p-1 rounded-lg bg-white/5 text-[#888] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-[#666] leading-normal font-sans">
              Enter target attention duration and spent screen time manually below. Tap Apply to save values in the simulator.
            </p>

            <div className="space-y-4">

              {/* Simulated Device Controls Section */}
              <div className="space-y-1.5 p-3.5 bg-[#050505] rounded-2xl border border-white/5">
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-[#555] block mb-2">
                  Simulated Device Controls
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Button 1: Flashlight Toggle */}
                  <button
                    id="btn_toggle_flashlight"
                    onClick={() => onFlashlightChange(!flashlightOn)}
                    className={`py-2.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      flashlightOn 
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)]' 
                        : 'bg-white/5 border-white/5 text-[#888] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Flashlight: {flashlightOn ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Button 2: Sound Mode Cycle */}
                  <button
                    id="btn_toggle_sound_mode"
                    onClick={() => {
                      const nextMode = 
                        soundMode === 'ring' ? 'vibrate' : 
                        soundMode === 'vibrate' ? 'silent' : 'ring';
                      onSoundModeChange(nextMode);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      soundMode === 'ring' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]' 
                        : soundMode === 'vibrate'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {soundMode === 'ring' && (
                      <>
                        <Volume2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Ring Mode</span>
                      </>
                    )}
                    {soundMode === 'vibrate' && (
                      <>
                        <span className="text-[10px]">📳</span>
                        <span>Vibrate</span>
                      </>
                    )}
                    {soundMode === 'silent' && (
                      <>
                        <VolumeX className="w-3.5 h-3.5 shrink-0" />
                        <span>Silent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Target Input Section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-[#555]">Target Duration Limit</span>
                  <span className="text-white font-mono">{draftTargetHrs}h {draftTargetMins}m</span>
                </div>
                <div className="flex gap-1.5 bg-[#050505] p-1 border border-white/5 rounded-xl">
                  <div className="flex items-center flex-1 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={draftTargetHrs}
                      onChange={(e) => setDraftTargetHrs(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-[8px] text-[#444] font-bold uppercase font-mono">Hr</span>
                  </div>
                  <div className="w-[1px] bg-white/5 self-stretch" />
                  <div className="flex items-center flex-1 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={draftTargetMins}
                      onChange={(e) => setDraftTargetMins(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-[8px] text-[#444] font-bold uppercase font-mono">Min</span>
                  </div>
                </div>
              </div>

              {/* Spent Screen Time Section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-[#555]">Spent Screen Time</span>
                  <span className="text-[#2bcfc1] font-mono">{draftSpentHrs}h {draftSpentMins}m</span>
                </div>
                <div className="flex gap-1.5 bg-[#050505] p-1 border border-white/5 rounded-xl">
                  <div className="flex items-center flex-1 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={draftSpentHrs}
                      onChange={(e) => setDraftSpentHrs(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-[8px] text-[#444] font-bold uppercase font-mono">Hr</span>
                  </div>
                  <div className="w-[1px] bg-white/5 self-stretch" />
                  <div className="flex items-center flex-1 px-2 py-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={draftSpentMins}
                      onChange={(e) => setDraftSpentMins(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-[8px] text-[#444] font-bold uppercase font-mono">Min</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                id="btn_apply_sheet_calibration"
                onClick={handleApplyCalibration}
                className="w-full py-2.5 bg-[#2bcfc1] text-black hover:bg-[#1f9f94] transition-all rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-[0_0_15px_rgba(43,207,193,0.15)] flex items-center justify-center gap-1.5"
              >
                <span>Apply Calibration Limits</span>
              </button>

              {/* Exhaust and Reset Presets inside calibration drawer */}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  id="btn_sheet_exhaust_lock"
                  onClick={() => {
                    setDraftSpentHrs(draftTargetHrs);
                    setDraftSpentMins(draftTargetMins);
                    onUsedChange(dailyTargetMinutes);
                    setIsCalibrating(false);
                  }}
                  className="flex-1 py-2 bg-red-950/20 hover:bg-red-900/40 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Exhaust Budget (Test Lock)
                </button>
                <button
                  id="btn_sheet_reset_spent"
                  onClick={() => {
                    setDraftSpentHrs(0);
                    setDraftSpentMins(0);
                    onUsedChange(0);
                    setIsCalibrating(false);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[9px] text-[#888] hover:text-white border border-white/5 rounded-lg transition-all"
                >
                  Reset Spent
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
