import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, Signal, Volume2, VolumeX, ShieldAlert, Zap, ZapOff, CheckCircle2, Flame } from 'lucide-react';

interface PhoneContainerProps {
  children: React.ReactNode;
  currentTimeString: string;
  flashlightOn: boolean;
  soundMode: 'ring' | 'vibrate' | 'silent';
}

export default function PhoneContainer({
  children,
  currentTimeString,
  flashlightOn,
  soundMode
}: PhoneContainerProps) {
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [showSwipeBlocked, setShowSwipeBlocked] = useState(false);
  const [isAttemptingSwipe, setIsAttemptingSwipe] = useState(false);
  
  // Track swipe drag starts
  const touchStartY = useRef<number | null>(null);
  const mouseStartY = useRef<number | null>(null);

  // Slow decay of battery over time for immersion
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 5 ? prev - 1 : 100));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Touch start handlers to detect slide down
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && touch.clientY < 180) { // Top region of the phone
      touchStartY.current = touch.clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touch = e.touches[0];
    const diffY = touch.clientY - touchStartY.current;
    if (diffY > 25) { // Swiped downwards by 25px
      setShowSwipeBlocked(true);
      touchStartY.current = null;
    }
  };

  // Mouse drag handlers to support desktop simulator dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    if (relativeY < 80) { // Clicked near the status bar
      mouseStartY.current = e.clientY;
      setIsAttemptingSwipe(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAttemptingSwipe || mouseStartY.current === null) return;
    const diffY = e.clientY - mouseStartY.current;
    if (diffY > 20) {
      setShowSwipeBlocked(true);
      setIsAttemptingSwipe(false);
      mouseStartY.current = null;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsAttemptingSwipe(false);
    mouseStartY.current = null;
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="w-full max-w-md mx-auto aspect-[9/19.5] rounded-[55px] border-[12px] border-[#0a0a0a] bg-[#050505] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] relative flex flex-col overflow-hidden text-[#e0e0e0] ring-2 ring-white/5 select-none"
    >
      
      {/* Top Speaker Ear Piece & Simulated Glowing Rear Flashlight */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-[#050505] z-50 flex items-center justify-center border border-white/5 relative">
        <div className="w-12 h-1 rounded-full bg-white/10" />
        
        {/* Flashlight LED simulator feedback glow */}
        {flashlightOn && (
          <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-20 h-[10px] bg-yellow-400 rounded-full blur-[4px] animate-pulse opacity-90 z-50" />
        )}
      </div>

      {/* Dynamic Island / Notch Camera Spacer */}
      <div className="absolute top-[22px] left-8 right-8 h-8 flex items-center justify-between px-2 text-xs font-semibold select-none z-40 pointer-events-none">
        
        {/* Live Left Indicators (Clock, active flashlight badge) */}
        <div className="flex items-center gap-1.5 pl-2 z-40">
          <span className="text-[#888] tracking-widest font-display text-[11px] font-medium">{currentTimeString}</span>
          {flashlightOn && (
            <span className="inline-flex items-center px-1 py-0.5 rounded bg-yellow-400 text-black text-[7px] font-black uppercase tracking-wider animate-pulse">
              <Zap className="w-2 h-2 fill-current shrink-0 mr-0.5" />
              <span>LED</span>
            </span>
          )}
        </div>
        
        {/* Status indicators on Right (5G, battery, sound mode icon) */}
        <div className="flex items-center gap-1.5 pr-2 text-[#888] z-40">
          {/* Audio mode indicator icon */}
          {soundMode === 'ring' && <Volume2 className="w-3.5 h-3.5 text-emerald-400 opacity-90" title="Ringer Mode" />}
          {soundMode === 'vibrate' && (
            <div className="flex gap-0.5 animate-bounce">
              <span className="text-[9px] font-extrabold text-orange-400">📳</span>
            </div>
          )}
          {soundMode === 'silent' && <VolumeX className="w-3.5 h-3.5 text-red-400 opacity-90 animate-pulse" title="Silent Mode" />}

          <Signal className="w-3.5 h-3.5 opacity-80" />
          <span className="text-[9px] font-display uppercase tracking-widest font-semibold">5G</span>
          <Wifi className="w-3.5 h-3.5 opacity-80" />
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono leading-none">{batteryLevel}%</span>
            <div className="w-5 h-2.5 rounded-sm border border-[#666] p-0.5 flex">
              <div className="h-full bg-[#2bcfc1] rounded-2xs" style={{ width: `${batteryLevel}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Internal Phone Canvas */}
      <div className="flex-1 w-full flex flex-col pt-12 pb-4 overflow-hidden relative">
        {children}
      </div>

      {/* Swipe Down Blocked Absolute Security Shield Overlay popup */}
      {showSwipeBlocked && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-[100] p-6 flex flex-col justify-center items-center text-center animate-fade-in">
          
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-red-500 mb-1.5">
            System Overrides Blocked
          </span>
          <h3 className="text-xl font-light font-display tracking-tight text-white mb-3">
            Gesture Intercepted
          </h3>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-4 max-w-xs space-y-3.5 mb-6 text-left shadow-lg">
            <p className="text-[11px] text-gray-400 leading-normal">
              <strong>Pull-down Access Shielded:</strong> Swiping down the system notification panel is completely disabled by ZenLock's absolute focus policy.
            </p>
            <p className="text-[11px] text-gray-400 leading-normal">
              <strong>Settings & Cache Blocked:</strong> Users are physically barred from swiping to Settings, clearing Chrome cache, or forcing app exit. Your attention target is secure under unbreakable sandboxing.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[9px] uppercase tracking-wider text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Cache Deletion Shield Active</span>
            </div>
          </div>

          <button
            id="btn_dismiss_swipe_blocked"
            onClick={() => setShowSwipeBlocked(false)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-[0.97] border border-white/10"
          >
            Acknowledge & Return
          </button>
        </div>
      )}

    </div>
  );
}
