import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Calendar, Hourglass, Power, Zap } from 'lucide-react';

interface LockOverlayProps {
  dailyTargetMinutes: number;
  usedMinutes: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function LockOverlay({
  dailyTargetMinutes,
  usedMinutes
}: LockOverlayProps) {
  const [timeToMidnight, setTimeToMidnight] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate live countdown until midnight tonight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0); // Midnight tonight
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeToMidnight(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle tap anywhere to wake/interact and show lock persistence
  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Randomize wake tap messages to answer customer questions
    const messages = [
      "Wake Lock Active: Display will stay on to enforce focus",
      "Power controls blocked: Shutdown/Restart disabled",
      "Strict Lockdown Mode: App close action is restricted",
      "ZenLock Shield: Access denied until countdown completes",
      "Discipline active. Stay present!"
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setTapMessage(randomMsg);

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    const timeout = setTimeout(() => {
      setTapMessage(null);
    }, 2500);
    setToastTimeout(timeout);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800);
  };

  return (
    <div 
      onClick={handleScreenTap}
      className="absolute inset-0 bg-[#050505]/98 backdrop-blur-xl flex flex-col z-50 text-[#e0e0e0] px-6 pt-16 pb-8 animate-fade-in justify-between select-none cursor-pointer overflow-hidden"
    >
      {/* Background Tap Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-[#2bcfc1]/20 border border-[#2bcfc1]/40 pointer-events-none animate-[ping_0.8s_ease-out_forwards]"
          style={{
            left: ripple.x - 24,
            top: ripple.y - 24,
            width: 48,
            height: 48,
          }}
        />
      ))}

      {/* Interactive Toast Notifications at the top */}
      <div className="absolute top-18 left-4 right-4 z-50 pointer-events-none transition-all duration-300">
        {tapMessage ? (
          <div className="bg-black/95 border border-[#2bcfc1]/40 px-3 py-2.5 rounded-xl flex items-center gap-2 shadow-lg animate-[bounce_1s_infinite_alternate] max-w-sm mx-auto">
            <Zap className="w-3.5 h-3.5 text-[#2bcfc1] shrink-0" />
            <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-white leading-normal">
              {tapMessage}
            </p>
          </div>
        ) : (
          <div className="text-center opacity-40">
            <span className="text-[9px] uppercase tracking-widest text-[#555] font-mono">
              [ Tap screen to wake / view lock state ]
            </span>
          </div>
        )}
      </div>
      
      {/* Top Header Locked Icon */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto relative z-10">
        <div className="w-18 h-18 rounded-full bg-[#2bcfc1]/10 border border-[#2bcfc1]/30 flex items-center justify-center text-[#2bcfc1] animate-pulse shadow-[0_0_30px_rgba(43,207,193,0.15)]">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-1.5 px-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#2bcfc1]">
            enforced lock active
          </span>
          <h1 className="text-2xl font-light font-display tracking-tight text-white leading-tight">
            Attention Preserved
          </h1>
          <p className="text-xs text-[#888] max-w-xs mx-auto leading-relaxed">
            Your attention target has been met. Device functionality is locked down until tomorrow's system refresh.
          </p>

          {/* User Warning Alert Block */}
          <div className="p-3 text-left rounded-xl bg-red-950/20 border border-red-500/20 max-w-xs mx-auto mt-2 space-y-1.5 shadow-md">
            <p className="text-[10px] text-red-400 leading-normal font-sans flex items-start gap-1.5">
              <span>⚠️</span>
              <span>
                <strong>Hardware Lockdown Enforced:</strong> You won't be able to exit this screen, swipe home, close the tab, or perform device shutdown/restarts.
              </span>
            </p>
            <div className="pt-1.5 border-t border-red-500/10 flex items-center gap-2 text-[8px] uppercase tracking-wider text-red-500 font-bold font-mono">
              <Power className="w-2.5 h-2.5" />
              <span>Power Cycle Buttons Disabled</span>
            </div>
          </div>
        </div>

        {/* Screentime Stats inside lock */}
        <div className="w-full max-w-xs mt-4 space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <Hourglass className="w-4 h-4 text-[#2bcfc1]" />
              <div className="text-left">
                <p className="text-[9px] text-[#555] uppercase tracking-wider font-bold">Daily Allocation</p>
                <p className="text-xs font-mono font-bold text-white">{dailyTargetMinutes} minutes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-[#2bcfc1] uppercase tracking-wider font-bold">Used Today</p>
              <p className="text-xs font-mono font-bold text-[#2bcfc1]">{Math.round(usedMinutes)} minutes</p>
            </div>
          </div>

          {/* Time Countdown widget */}
          <div className="p-3.5 rounded-2xl bg-[#0a0a0a] border border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[#555] text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-display uppercase tracking-wider text-[9px] font-bold">Unlocks in Tomorrow</span>
            </div>
            <div className="text-xl font-mono tracking-widest text-[#bbb] mt-1 font-light">
              {timeToMidnight}
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status Banner */}
      <div className="mt-auto flex flex-col items-center gap-3 z-20 w-full max-w-xs mx-auto">
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#888] uppercase tracking-widest font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          <span>Strict Lock Mode Active</span>
        </div>
      </div>

    </div>
  );
}
