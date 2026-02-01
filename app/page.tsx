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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const detailInfoRef = useRef<HTMLDivElement>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchQuestions();
    
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

  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameActive && timeLeft === 0) {
      endGame();
    }
  }, [isGameActive, timeLeft]);

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setUserAnswer('');
    setIsCorrect(null);
  }, [currentQuestionIndex]);

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

  // 正解/不正解時に効果音を再生
  useEffect(() => {
    if (!soundEnabled || isCorrect === null) return;
    
    if (isCorrect && correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch((error) => {
        console.log('効果音の再生に失敗しました:', error);
      });
    } else if (!isCorrect && incorrectSoundRef.current) {
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch((error) => {
        console.log('効果音の再生に失敗しました:', error);
      });
    }
  }, [isCorrect, soundEnabled]);

  // ゲーム開始時にBGMを再生、終了時に停止
  useEffect(() => {
    if (!soundEnabled || !bgmRef.current) return;
    
    if (isGameActive) {
      bgmRef.current.play().catch((error) => {
        console.log('BGMの再生に失敗しました:', error);
      });
    } else {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  }, [isGameActive, soundEnabled]);

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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled && bgmRef.current && isGameActive) {
      bgmRef.current.play().catch((error) => {
        console.log('BGMの再生に失敗しました:', error);
      });
    } else if (soundEnabled && bgmRef.current) {
      bgmRef.current.pause();
    }
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
          <button
            className={styles.soundToggle}
            onClick={toggleSound}
            aria-label={soundEnabled ? '音声をオフ' : '音声をオン'}
            title={soundEnabled ? '音声をオフ' : '音声をオン'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
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
                key={`${currentQuestionIndex}-${index}-${choice}`}
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
