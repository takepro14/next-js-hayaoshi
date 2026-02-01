import styles from '../page.module.css';

interface StartScreenProps {
  selectedTimeLimit: number | null;
  soundEnabled: boolean;
  onSelectTimeLimit: (seconds: number | null) => void;
  onStartGame: () => void;
  onToggleSound: () => void;
}

export default function StartScreen({
  selectedTimeLimit,
  soundEnabled,
  onSelectTimeLimit,
  onStartGame,
  onToggleSound,
}: StartScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button
            className={styles.soundToggle}
            onClick={onToggleSound}
            aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
            title={soundEnabled ? '音声をオフ' : '音声をオン'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        <h1 className={styles.title}>横文字に強くなろう</h1>
        <p className={styles.description}>
          制限時間を選択して、できるだけ多くの横文字の意味を当てよう！
        </p>
        {selectedTimeLimit === null ? (
          <div className={styles.modeSelection}>
            <h3 className={styles.modeTitle}>時間制限を選択</h3>
            <div className={styles.modeButtons}>
              <button
                className={styles.modeButton}
                onClick={() => onSelectTimeLimit(30)}
              >
                30秒
              </button>
              <button
                className={styles.modeButton}
                onClick={() => onSelectTimeLimit(60)}
              >
                1分
              </button>
              <button
                className={styles.modeButton}
                onClick={() => onSelectTimeLimit(120)}
              >
                2分
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.modeConfirmation}>
            <p className={styles.modeInfo}>
              選択した時間: <strong>{selectedTimeLimit}秒</strong>
            </p>
            <div className={styles.modeActions}>
              <button className={styles.button} onClick={onStartGame}>
                ゲーム開始
              </button>
              <button
                className={styles.buttonSecondary}
                onClick={() => onSelectTimeLimit(null)}
              >
                時間を変更
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
