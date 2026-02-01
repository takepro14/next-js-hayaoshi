'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Question {
  id: number;
  question: string;
  answer: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    setTimeLeft(30);
    setIsGameActive(true);
    setUserAnswer('');
    setIsCorrect(null);
    setShowResult(false);
  };

  const endGame = () => {
    setIsGameActive(false);
    setShowResult(true);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGameActive || userAnswer.trim() === '') return;

    const currentQuestion = questions[currentQuestionIndex];
    const response = await fetch('/api/check-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        userAnswer: userAnswer.trim(),
      }),
    });

    const result = await response.json();
    setIsCorrect(result.correct);

    if (result.correct) {
      setScore(score + 1);
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setTimeout(() => {
        nextQuestion();
      }, 1500);
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

  const skipQuestion = () => {
    nextQuestion();
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
            <p className={styles.scoreText}>正解数: {score} / {questions.length}</p>
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
          <h1 className={styles.title}>早押しゲーム</h1>
          <p className={styles.description}>
            制限時間30秒でできるだけ多くの問題に正解しよう！
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
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.timer}>残り時間: {timeLeft}秒</div>
          <div className={styles.score}>スコア: {score}</div>
        </div>
        <div className={styles.questionNumber}>
          問題 {currentQuestionIndex + 1} / {questions.length}
        </div>
        <h2 className={styles.question}>{currentQuestion.question}</h2>
        <form onSubmit={handleAnswerSubmit} className={styles.form}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="答えを入力..."
            className={styles.input}
            autoFocus
            disabled={isCorrect !== null}
          />
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.button}
              disabled={isCorrect !== null || userAnswer.trim() === ''}
            >
              回答
            </button>
            <button
              type="button"
              className={styles.skipButton}
              onClick={skipQuestion}
              disabled={isCorrect !== null}
            >
              スキップ
            </button>
          </div>
        </form>
        {isCorrect !== null && (
          <div className={styles.feedback}>
            {isCorrect ? (
              <p className={styles.correct}>正解！</p>
            ) : (
              <p className={styles.incorrect}>
                不正解。正解は「{currentQuestion.answer}」です。
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
