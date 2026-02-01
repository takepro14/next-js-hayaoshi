import { useRef, useEffect } from 'react';
import { Question } from '../types';
import styles from '../page.module.css';

interface GameScreenProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
  userAnswer: string;
  isCorrect: boolean | null;
  soundEnabled: boolean;
  onAnswerClick: (answer: string) => void;
  onQuit: () => void;
  onToggleSound: () => void;
}

export default function GameScreen({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  score,
  userAnswer,
  isCorrect,
  soundEnabled,
  onAnswerClick,
  onQuit,
  onToggleSound,
}: GameScreenProps) {
  const detailInfoRef = useRef<HTMLDivElement>(null);

  // 回答時に詳細情報までスクロール
  useEffect(() => {
    if (isCorrect !== null && detailInfoRef.current) {
      setTimeout(() => {
        detailInfoRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [isCorrect]);

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isCorrect === true ? styles.cardCorrect : isCorrect === false ? styles.cardIncorrect : ''}`}>
        <div className={styles.header}>
          <div className={styles.timer}>残り時間: {timeLeft}秒</div>
          <div className={`${styles.score} ${isCorrect === true ? styles.scoreIncrease : ''}`}>
            スコア: {score}
          </div>
          <button
            className={styles.soundToggle}
            onClick={onToggleSound}
            aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
            title={soundEnabled ? '音声をオフ' : '音声をオン'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className={styles.questionNumber}>
            問題 {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <button
            className={styles.quitButton}
            onClick={onQuit}
            type="button"
          >
            中断
          </button>
        </div>
        <h2 className={styles.question}>{currentQuestion.question}</h2>
        <div className={styles.choicesContainer}>
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = userAnswer === choice;
            const isCorrectChoice = choice === currentQuestion.answer;
            let buttonClass = styles.choiceButton;

            if (isCorrect !== null) {
              if (isCorrectChoice) {
                buttonClass = styles.choiceButtonCorrect;
              } else if (isSelected && !isCorrectChoice) {
                buttonClass = styles.choiceButtonIncorrect;
              } else {
                buttonClass = styles.choiceButtonDisabled;
              }
            }

            return (
              <button
                key={`${currentQuestionIndex}-${index}-${choice}`}
                type="button"
                className={buttonClass}
                onClick={() => onAnswerClick(choice)}
                disabled={isCorrect !== null}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {isCorrect !== null && (
          <>
            {isCorrect && (
              <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={styles.particle} />
                ))}
              </div>
            )}
            <div className={styles.feedback}>
              {isCorrect ? (
                <>
                  <p className={`${styles.correct} ${styles.correctAnimation}`}>正解！</p>
                  <div ref={detailInfoRef} className={styles.detailInfo}>
                    {currentQuestion.etymology && (
                      <div className={styles.detailItem}>
                        <strong>【語源】</strong> {currentQuestion.etymology}
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <strong>【意味】</strong> {currentQuestion.meaning}
                    </div>
                    {currentQuestion.example && (
                      <div className={styles.detailItem}>
                        <strong>【例文】</strong> {currentQuestion.example}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.incorrect}>不正解。正解は「{currentQuestion.answer}」です。</p>
                  <div ref={detailInfoRef} className={styles.detailInfo}>
                    {currentQuestion.etymology && (
                      <div className={styles.detailItem}>
                        <strong>【語源】</strong> {currentQuestion.etymology}
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <strong>【意味】</strong> {currentQuestion.meaning}
                    </div>
                    {currentQuestion.example && (
                      <div className={styles.detailItem}>
                        <strong>【例文】</strong> {currentQuestion.example}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
