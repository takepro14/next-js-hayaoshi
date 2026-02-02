import { AnswerResult } from '../types';
import styles from '../page.module.css';

// categoryスタイルをインポートするために、page.module.cssから読み込む

interface ResultDetailProps {
  answerResults: AnswerResult[];
  onBackToSummary: () => void;
  onRestart: () => void;
}

export default function ResultDetail({
  answerResults,
  onBackToSummary,
  onRestart
}: ResultDetailProps) {
  const correctAnswers = answerResults.filter((r) => r.isCorrect);
  const incorrectAnswers = answerResults.filter((r) => !r.isCorrect);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>結果発表</h1>

        {/* 正解した問題 */}
        {correctAnswers.length > 0 && (
          <div className={styles.resultSection}>
            <h2 className={styles.resultSectionTitle}>✓ 正解 ({correctAnswers.length}問)</h2>
            <div className={styles.resultList}>
              {correctAnswers.map((result, index) => (
                <div key={index} className={styles.resultItem}>
                  <div className={styles.resultItemHeader}>
                    <span className={styles.resultNumber}>Q{index + 1}</span>
                    <span className={styles.resultStatusCorrect}>✓ 正解</span>
                  </div>
                  {result.category && (
                    <div className={styles.category} style={{ marginBottom: '8px' }}>
                      {result.category}
                    </div>
                  )}
                  <p className={styles.resultQuestion}>{result.question}</p>
                  <div className={styles.resultAnswer}>
                    <strong>あなたの回答:</strong> {result.userAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 不正解だった問題 */}
        {incorrectAnswers.length > 0 && (
          <div className={styles.resultSection}>
            <h2 className={styles.resultSectionTitle}>✗ 不正解 ({incorrectAnswers.length}問)</h2>
            <div className={styles.resultList}>
              {incorrectAnswers.map((result, index) => (
                <div key={index} className={styles.resultItem}>
                  <div className={styles.resultItemHeader}>
                    <span className={styles.resultNumber}>
                      Q{correctAnswers.length + index + 1}
                    </span>
                    <span className={styles.resultStatusIncorrect}>✗ 不正解</span>
                  </div>
                  {result.category && (
                    <div className={styles.category} style={{ marginBottom: '8px' }}>
                      {result.category}
                    </div>
                  )}
                  <p className={styles.resultQuestion}>{result.question}</p>
                  <div className={styles.resultAnswer}>
                    <strong>あなたの回答:</strong>{' '}
                    <span className={styles.incorrectAnswer}>{result.userAnswer}</span>
                  </div>
                  <div className={styles.resultAnswer}>
                    <strong>正解:</strong>{' '}
                    <span className={styles.correctAnswer}>{result.correctAnswer}</span>
                  </div>
                  {result.meaning && (
                    <div className={styles.resultDetail}>
                      <strong>【意味】</strong> {result.meaning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.resultActions}>
          <button className={styles.button} onClick={onBackToSummary}>
            サマリーに戻る
          </button>
          <button className={styles.buttonSecondary} onClick={onRestart}>
            もう一度遊ぶ
          </button>
        </div>
      </div>
    </div>
  );
}
