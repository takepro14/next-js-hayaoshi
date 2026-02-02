import { GameMode } from '../types';
import styles from '../page.module.css';

interface StartScreenProps {
  gameConfig: { mode: GameMode; timeLimit?: number; selectedCategory?: string } | null;
  soundEnabled: boolean;
  categories: string[];
  onSelectMode: (mode: GameMode, timeLimit?: number) => void;
  onSelectCategory: (category: string | null) => void;
  onStartGame: () => void;
  onToggleSound: () => void;
  onStartBGM: () => void;
}

export default function StartScreen({
  gameConfig,
  soundEnabled,
  categories,
  onSelectMode,
  onSelectCategory,
  onStartGame,
  onToggleSound,
  onStartBGM,
}: StartScreenProps) {
  if (gameConfig === null) {
    // モード選択画面
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              className={styles.soundToggle}
              onClick={() => {
                onStartBGM();
                onToggleSound();
              }}
              aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
              title={soundEnabled ? '音声をオフ' : '音声をオン'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <h1 className={styles.title}>横文字に強くなろう</h1>
          <p className={styles.description}>
            モードを選択して、できるだけ多くの横文字の意味を当てよう！
          </p>
          <div className={styles.modeSelection}>
            <h3 className={styles.modeTitle}>モードを選択</h3>
            <div className={styles.modeButtons}>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('timeAttack');
                }}
              >
                <div className={styles.modeButtonContent}>
                  <div className={styles.modeButtonTitle}>⏱️ タイムアタック</div>
                  <div className={styles.modeButtonDescription}>制限時間内に回答</div>
                </div>
              </button>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('suddenDeath');
                }}
              >
                <div className={styles.modeButtonContent}>
                  <div className={styles.modeButtonTitle}>⚡ サドンデス</div>
                  <div className={styles.modeButtonDescription}>1問でも間違えたら終了</div>
                </div>
              </button>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('endless');
                }}
              >
                <div className={styles.modeButtonContent}>
                  <div className={styles.modeButtonTitle}>♾️ エンドレス</div>
                  <div className={styles.modeButtonDescription}>時間制限なしの練習</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameConfig.mode === 'timeAttack' && !gameConfig.timeLimit) {
    // タイムアタックモードの時間選択
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              className={styles.soundToggle}
              onClick={() => {
                onStartBGM();
                onToggleSound();
              }}
              aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
              title={soundEnabled ? '音声をオフ' : '音声をオン'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <h1 className={styles.title}>タイムアタック</h1>
          <p className={styles.description}>
            制限時間内にできるだけ多くの問題に答えよう！
          </p>
          <div className={styles.modeSelection}>
            <h3 className={styles.modeTitle}>カテゴリーを選択（オプション）</h3>
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeButton} ${!gameConfig.selectedCategory ? styles.modeButtonActive : ''}`}
                onClick={() => {
                  onStartBGM();
                  onSelectCategory(null);
                }}
              >
                すべて
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.modeButton} ${gameConfig.selectedCategory === category ? styles.modeButtonActive : ''}`}
                  onClick={() => {
                    onStartBGM();
                    onSelectCategory(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <h3 className={styles.modeTitle} style={{ marginTop: '32px' }}>時間制限を選択</h3>
            <div className={styles.modeButtons}>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('timeAttack', 30);
                }}
              >
                30秒
              </button>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('timeAttack', 60);
                }}
              >
                1分
              </button>
              <button
                className={styles.modeButton}
                onClick={() => {
                  onStartBGM();
                  onSelectMode('timeAttack', 120);
                }}
              >
                2分
              </button>
            </div>
            <button
              className={styles.buttonSecondary}
              onClick={() => onSelectMode(null as any, undefined)}
              style={{ marginTop: '16px' }}
            >
              モード選択に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // モード確認画面
  const getModeName = () => {
    switch (gameConfig.mode) {
      case 'timeAttack':
        return '⏱️ タイムアタック';
      case 'suddenDeath':
        return '⚡ サドンデス';
      case 'endless':
        return '♾️ エンドレス';
    }
  };

  const getModeDescription = () => {
    switch (gameConfig.mode) {
      case 'timeAttack':
        return `制限時間: ${gameConfig.timeLimit}秒`;
      case 'suddenDeath':
        return '1問でも間違えたら終了！全問正解を目指そう！';
      case 'endless':
        return '時間制限なし！何問でも挑戦できる練習モード';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            className={styles.soundToggle}
            onClick={() => {
              onStartBGM();
              onToggleSound();
            }}
            aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
            title={soundEnabled ? '音声をオフ' : '音声をオン'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        <h1 className={styles.title}>{getModeName()}</h1>
        <p className={styles.description}>
          {getModeDescription()}
        </p>
        <div className={styles.modeConfirmation}>
          <div className={styles.modeSelection}>
            <h3 className={styles.modeTitle}>カテゴリーを選択（オプション）</h3>
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeButton} ${!gameConfig.selectedCategory ? styles.modeButtonActive : ''}`}
                onClick={() => {
                  onStartBGM();
                  onSelectCategory(null);
                }}
              >
                すべて
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.modeButton} ${gameConfig.selectedCategory === category ? styles.modeButtonActive : ''}`}
                  onClick={() => {
                    onStartBGM();
                    onSelectCategory(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.modeActions}>
            <button className={styles.button} onClick={() => {
              onStartBGM();
              onStartGame();
            }}>
              ゲーム開始
            </button>
            <button
              className={styles.buttonSecondary}
              onClick={() => onSelectMode(null as any, undefined)}
            >
              モードを変更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
