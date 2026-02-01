import styles from '../page.module.css';

interface ResultSummaryProps {
  score: number;
  totalQuestions: number;
  onShowDetail: () => void;
  onRestart: () => void;
}

export default function ResultSummary({
  score,
  totalQuestions,
  onShowDetail,
  onRestart,
}: ResultSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>ゲーム終了！</h1>
        <div className={styles.scoreResult}>
          <p className={styles.scoreText}>
            正解数: {score} / {totalQuestions}
          </p>
          <p className={styles.accuracyText}>
            正答率: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
          </p>
        </div>
        <div className={styles.resultActions}>
          <button className={styles.button} onClick={onShowDetail}>
            詳細を見る
          </button>
          <button className={styles.buttonSecondary} onClick={onRestart}>
            もう一度遊ぶ
          </button>
        </div>
      </div>
    </div>
  );
}
