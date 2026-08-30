import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ArrowRight } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

interface PreloaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  'INITIALIZING SYSTEM CORE v4.8.2...',
  'CALIBRATING THREE.JS 3D ACCELERATION...',
  'OPTIMIZING ZERO-LAG HARDWARE VIEWPORT...',
  'SYNCING AI NEURAL ASSISTANT MATRIX...',
  'SYSTEM ONLINE // ACCESS GRANTED',
];

const Preloader = ({ onComplete }: PreloaderProps) => {
  const { playBoot, playBeep, vibrate } = useSound();
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    // Play initial cyber boot sound
    playBoot();
    vibrate([15, 30, 15]);

    // Progress counter timer
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds for crisp snappiness

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);

      setProgress(pct);

      // Advance boot logs corresponding to percentage
      const nextLog = Math.min(
        Math.floor((pct / 100) * BOOT_LOGS.length),
        BOOT_LOGS.length - 1
      );
      setLogIndex(nextLog);

      if (pct % 25 === 0 && pct < 100) {
        playBeep(600 + pct * 6);
      }

      if (pct >= 100) {
        clearInterval(timer);
        if (!completedRef.current) {
          completedRef.current = true;
          playBeep(1200);
          vibrate([20, 40, 30]);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 600);
          }, 350);
        }
      }
    }, 28);

    // Keyboard listener: Escape or Space to skip instantly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const skipIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setProgress(100);
    vibrate(20);
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(12px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white overflow-hidden select-none"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          {/* Cyber Ambient Glow Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950 pointer-events-none" />

          {/* Animated Background Grid Lines */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:4rem_4rem]"
          />

          {/* Glowing Circular Aperture HUD */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Outer Spinning Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-cyan-500/40 pointer-events-none"
            />

            {/* Middle Reverse Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-purple-500/50 border-t-cyan-400 border-b-transparent pointer-events-none"
            />

            {/* Glowing Center Hologram Core */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)] border border-white/20">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                MA
              </span>
              <span className="text-[9px] font-mono text-cyan-200 tracking-widest uppercase">
                CORE
              </span>
            </div>

            {/* Pulse Glow Beacon */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-cyan-400/20 animate-ping pointer-events-none" />
          </div>

          {/* Brand & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-1 z-10 px-4"
          >
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              MUHAMMAD AHMAD
            </h2>
            <p className="text-[11px] sm:text-xs font-mono text-gray-400 uppercase tracking-wider">
              Full Stack & AI Engineer Portfolio
            </p>
          </motion.div>

          {/* Progress Bar & Percentage */}
          <div className="w-64 sm:w-80 mt-6 space-y-2 z-10 px-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                SYSTEM BOOT
              </span>
              <span className="text-white font-bold tracking-wider">{progress}%</span>
            </div>

            {/* Progress Track */}
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800 relative shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full relative shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_#ffffff]" />
              </motion.div>
            </div>
          </div>

          {/* Live Diagnostic Boot Log Line */}
          <div className="mt-4 h-6 flex items-center justify-center text-center px-4 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={logIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-300/90 bg-gray-900/60 px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{BOOT_LOGS[logIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Skip Button for immediate entry */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={skipIntro}
            className="mt-8 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-cyan-500/40 text-gray-400 hover:text-white text-[11px] font-mono transition-all flex items-center gap-1.5 z-10 cursor-pointer shadow-sm"
          >
            <span>SKIP INTRO</span>
            <span className="hidden sm:inline text-gray-500">[ESC]</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
