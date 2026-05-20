import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import PhoneContainer from './components/PhoneContainer';
import HomeApp from './components/HomeApp';
import LockOverlay from './components/LockOverlay';

export default function App() {
  // Real dynamic clock time string for the iOS status bar
  const [timeString, setTimeString] = useState("");

  // Core configuration states synced with server
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(120);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [soundMode, setSoundMode] = useState<'ring' | 'vibrate' | 'silent'>('ring');

  // Sync clock time
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeString(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 1. Initial State Load from Server (Unbreakable Shield API)
  const fetchStateFromServer = async () => {
    try {
      const res = await fetch('/api/shield-state');
      if (res.ok) {
        const data = await res.json();
        setDailyTargetMinutes(data.dailyTargetMinutes);
        setUsedMinutes(data.usedMinutes);
        setIsMonitoring(data.isMonitoring);
        setFlashlightOn(Boolean(data.flashlightOn));
        if (data.soundMode === 'ring' || data.soundMode === 'vibrate' || data.soundMode === 'silent') {
          setSoundMode(data.soundMode);
        }
        setIsInitialized(true);
      }
    } catch (e) {
      console.error("Failed to connect to ZenLock Shield backend:", e);
    }
  };

  useEffect(() => {
    fetchStateFromServer();
  }, []);

  // 2. Periodic poll from server to remain perfectly in sync and handle screen closures / data resets gracefully
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchStateFromServer();
    }, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  // 3. Helper to update state to server
  const updateStateOnServer = async (updates: {
    dailyTargetMinutes?: number;
    usedMinutes?: number;
    isMonitoring?: boolean;
    flashlightOn?: boolean;
    soundMode?: 'ring' | 'vibrate' | 'silent';
  }) => {
    try {
      const res = await fetch('/api/shield-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setDailyTargetMinutes(data.dailyTargetMinutes);
        setUsedMinutes(data.usedMinutes);
        setIsMonitoring(data.isMonitoring);
        setFlashlightOn(Boolean(data.flashlightOn));
        if (data.soundMode === 'ring' || data.soundMode === 'vibrate' || data.soundMode === 'silent') {
          setSoundMode(data.soundMode);
        }
      }
    } catch (e) {
      console.error("Failed to push update to ZenLock Shield backend:", e);
    }
  };

  const handleTargetChange = (val: number) => {
    setDailyTargetMinutes(val);
    updateStateOnServer({ dailyTargetMinutes: val });
  };

  const handleUsedChange = (val: number) => {
    setUsedMinutes(val);
    updateStateOnServer({ usedMinutes: val });
  };

  const handleToggleMonitoring = () => {
    const nextMonitoring = !isMonitoring;
    setIsMonitoring(nextMonitoring);
    updateStateOnServer({ isMonitoring: nextMonitoring, usedMinutes });
  };

  const handleFlashlightChange = (val: boolean) => {
    setFlashlightOn(val);
    updateStateOnServer({ flashlightOn: val });
  };

  const handleSoundModeChange = (val: 'ring' | 'vibrate' | 'silent') => {
    setSoundMode(val);
    updateStateOnServer({ soundMode: val });
  };

  // Local real-time UI clock updates (1s frequency)
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      setUsedMinutes(prev => {
        const next = prev + (1 / 60);
        if (next >= dailyTargetMinutes) {
          setIsMonitoring(false);
          // Direct lockdown endpoint sync
          updateStateOnServer({ isMonitoring: false, usedMinutes: dailyTargetMinutes });
          return dailyTargetMinutes;
        }
        return next;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isMonitoring, dailyTargetMinutes]);

  // Is phone locked state
  const isLocked = usedMinutes >= dailyTargetMinutes;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      
      {/* Premium dark atmospheric visual glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#2bcfc1]/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/2 blur-3xl pointer-events-none" />

      {/* Primary centered layout - displaying ONLY the phone container beautifully */}
      <div className="relative z-10 w-full max-w-sm my-6 flex flex-col items-center animate-fade-in">
        
        {/* Subtle decorative branding above the phone container */}
        <div className="text-center mb-5 space-y-1">
          <div className="inline-flex items-center gap-1 bg-[#2bcfc1]/10 text-[#2bcfc1] px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-[#2bcfc1]/20 uppercase tracking-widest">
            <Shield className="w-3 h-3 animate-pulse" />
            <span>ZenLock Screen Guard</span>
          </div>
        </div>

        {/* Clean Interactive Smartphone Container */}
        <PhoneContainer 
          currentTimeString={timeString}
          flashlightOn={flashlightOn}
          soundMode={soundMode}
        >
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Unlocked Home Application Monitor screen */}
            {isInitialized ? (
              <HomeApp
                dailyTargetMinutes={dailyTargetMinutes}
                usedMinutes={usedMinutes}
                onTargetChange={handleTargetChange}
                onUsedChange={handleUsedChange}
                isMonitoring={isMonitoring}
                onToggleMonitoring={handleToggleMonitoring}
                flashlightOn={flashlightOn}
                soundMode={soundMode}
                onFlashlightChange={handleFlashlightChange}
                onSoundModeChange={handleSoundModeChange}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] gap-3">
                <div className="w-6 h-6 border-2 border-[#2bcfc1] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[#555] uppercase tracking-[0.2em] font-mono">Initializing Shield...</span>
              </div>
            )}

            {/* Secure Lockdown takeover screen (when target spent time has met or exceeded target budget) */}
            {isLocked && (
              <LockOverlay
                dailyTargetMinutes={dailyTargetMinutes}
                usedMinutes={usedMinutes}
                // No bypass handlers provided here so it is absolute, strict lockdown without reset UI
              />
            )}

          </div>

        </PhoneContainer>
        
        {/* Humble instruction link */}
        <p className="text-[10px] text-[#444] tracking-wider uppercase font-mono mt-4 font-bold">
          {isLocked ? "ZenLock Strict Mode Active" : "Swipe down status bar or click sliders to calibrate"}
        </p>
      </div>

    </div>
  );
}
