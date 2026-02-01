'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Question {
  id: number;
  question: string;
  answer: string;
  choices: string[];
  etymology?: string;
  meaning: string;
  example?: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const detailInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameActive && timeLeft === 0) {
      endGame();
    }
  }, [isGameActive, timeLeft]);

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

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestions(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setIsLoading(false);
    }
  };

  const startGame = () => {
    if (questions.length === 0) return;
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(60);
    setIsGameActive(true);
    setUserAnswer('');
    setIsCorrect(null);
    setShowResult(false);
  };

  const endGame = () => {
    setIsGameActive(false);
    setShowResult(true);
  };

  const handleAnswerClick = async (selectedAnswer: string) => {
    if (!isGameActive || isCorrect !== null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const response = await fetch('/api/check-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer
      })
    });

    const result = await response.json();
    setIsCorrect(result.correct);
    setUserAnswer(selectedAnswer);

    if (result.correct) {
      setScore(score + 1);
      setTimeout(() => {
        nextQuestion();
      }, 3000);
    } else {
      setTimeout(() => {
        nextQuestion();
      }, 3500);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setIsCorrect(null);
    } else {
      endGame();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>問題を読み込み中...</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>ゲーム終了！</h1>
          <div className={styles.scoreResult}>
            <p className={styles.scoreText}>
              正解数: {score} / {questions.length}
            </p>
            <p className={styles.accuracyText}>
              正答率: {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
          <button className={styles.button} onClick={startGame}>
            もう一度遊ぶ
          </button>
        </div>
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>横文字に強くなろう</h1>
          <p className={styles.description}>
            制限時間1分でできるだけ多くの横文字の意味を当てよう！
          </p>
          <button className={styles.button} onClick={startGame}>
            ゲーム開始
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${isCorrect === true ? styles.cardCorrect : isCorrect === false ? styles.cardIncorrect : ''}`}>
        <div className={styles.header}>
          <div className={styles.timer}>残り時間: {timeLeft}秒</div>
          <div className={`${styles.score} ${isCorrect === true ? styles.scoreIncrease : ''}`}>
            スコア: {score}
          </div>
        </div>
        <div className={styles.questionNumber}>
          問題 {currentQuestionIndex + 1} / {questions.length}
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
                key={index}
                type="button"
                className={buttonClass}
                onClick={() => handleAnswerClick(choice)}
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
