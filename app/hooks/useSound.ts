import { useEffect, useRef, useState } from 'react';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 音声ファイルを初期化
    bgmRef.current = new Audio('/sounds/bgm.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3;
    
    correctSoundRef.current = new Audio('/sounds/correct.mp3');
    correctSoundRef.current.volume = 0.5;
    
    incorrectSoundRef.current = new Audio('/sounds/incorrect.mp3');
    incorrectSoundRef.current.volume = 0.5;
    
    return () => {
      // クリーンアップ
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current = null;
      }
      if (incorrectSoundRef.current) {
        incorrectSoundRef.current.pause();
        incorrectSoundRef.current = null;
      }
    };
  }, []);

  // トップ画面からBGMを再生
  useEffect(() => {
    if (!soundEnabled || !bgmRef.current) return;
    
    bgmRef.current.play().catch((error) => {
      console.log('BGMの再生に失敗しました:', error);
    });
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled && bgmRef.current) {
      bgmRef.current.play().catch((error) => {
        console.log('BGMの再生に失敗しました:', error);
      });
    } else if (soundEnabled && bgmRef.current) {
      bgmRef.current.pause();
    }
  };

  const playCorrectSound = () => {
    if (!soundEnabled || !correctSoundRef.current) return;
    correctSoundRef.current.currentTime = 0;
    correctSoundRef.current.play().catch((error) => {
      console.log('効果音の再生に失敗しました:', error);
    });
  };

  const playIncorrectSound = () => {
    if (!soundEnabled || !incorrectSoundRef.current) return;
    incorrectSoundRef.current.currentTime = 0;
    incorrectSoundRef.current.play().catch((error) => {
      console.log('効果音の再生に失敗しました:', error);
    });
  };

  return {
    soundEnabled,
    toggleSound,
    playCorrectSound,
    playIncorrectSound,
  };
}
