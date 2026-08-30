import React, { createContext, useContext, useState } from 'react';
import { soundManager } from '../components/common/SoundManager';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playWhoosh: () => void;
  playBoot: () => void;
  playKeypress: () => void;
  playBeep: (pitch?: number) => void;
  vibrate: (pattern?: number | number[]) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playHover: () => soundManager.playHover(),
        playClick: () => soundManager.playClick(),
        playSuccess: () => soundManager.playSuccess(),
        playWhoosh: () => soundManager.playWhoosh(),
        playBoot: () => soundManager.playBoot(),
        playKeypress: () => soundManager.playKeypress(),
        playBeep: (pitch?: number) => soundManager.playBeep(pitch),
        vibrate: (pattern?: number | number[]) => soundManager.vibrate(pattern),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

