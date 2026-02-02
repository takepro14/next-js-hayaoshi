import { useEffect, useRef, useState, useCallback } from 'react';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
    
    setIsInitialized(true);
    
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

  // 音声ON/OFFの変更時にBGMを制御
  useEffect(() => {
    if (!bgmRef.current) return;
    
    if (soundEnabled) {
      bgmRef.current.play().catch(() => {
        // エラーは無視する（ユーザー操作が必要な場合がある）
      });
    } else {
      bgmRef.current.pause();
    }
  }, [soundEnabled]);

  const startBGM = useCallback(() => {
    if (!soundEnabled || !bgmRef.current) return;
    // 既に再生中の場合は何もしない
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(() => {
        // エラーは無視する（既にユーザー操作時なので通常は成功する）
      });
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    if (newSoundEnabled && bgmRef.current) {
      bgmRef.current.play().catch(() => {
        // エラーは無視する
      });
    } else if (!newSoundEnabled && bgmRef.current) {
      bgmRef.current.pause();
    }
  };

  const playCorrectSound = useCallback(() => {
    if (!soundEnabled || !correctSoundRef.current) return;
    correctSoundRef.current.currentTime = 0;
    correctSoundRef.current.play().catch(() => {
      // エラーは無視する
    });
  }, [soundEnabled]);

  const playIncorrectSound = useCallback(() => {
    if (!soundEnabled || !incorrectSoundRef.current) return;
    incorrectSoundRef.current.currentTime = 0;
    incorrectSoundRef.current.play().catch(() => {
      // エラーは無視する
    });
  }, [soundEnabled]);

  return {
    soundEnabled,
    isInitialized,
    toggleSound,
    startBGM,
    playCorrectSound,
    playIncorrectSound,
  };
}
