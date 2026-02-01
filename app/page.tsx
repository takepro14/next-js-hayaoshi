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

interface AnswerResult {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
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
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showDetailResult, setShowDetailResult] = useState(false);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
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

  // トップ画面からBGMを再生
  useEffect(() => {
    if (!soundEnabled || !bgmRef.current || isLoading) return;
    
    bgmRef.current.play().catch((error) => {
      console.log('BGMの再生に失敗しました:', error);
    });
  }, [soundEnabled, isLoading]);

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

  // BGMは常に再生（ゲーム中もトップ画面でも継続）

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

  const selectTimeLimit = (seconds: number) => {
    setSelectedTimeLimit(seconds);
  };

  const startGame = () => {
    if (questions.length === 0 || selectedTimeLimit === null) return;
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(selectedTimeLimit);
    setIsGameActive(true);
    setUserAnswer('');
    setIsCorrect(null);
    setShowResult(false);
    setShowDetailResult(false);
    setAnswerResults([]);
  };

  const endGame = () => {
    setIsGameActive(false);
    setShowResult(true);
  };

  const handleQuit = () => {
    if (window.confirm('ゲームを中断しますか？\n現在のスコアは失われます。')) {
      setIsGameActive(false);
      setSelectedTimeLimit(null);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(60);
      setUserAnswer('');
      setIsCorrect(null);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled && bgmRef.current && !isLoading) {
      bgmRef.current.play().catch((error) => {
        console.log('BGMの再生に失敗しました:', error);
      });
    } else if (soundEnabled && bgmRef.current) {
      bgmRef.current.pause();
    }
  };

  const handleAnswerClick = (selectedAnswer: string) => {
    if (!isGameActive || isCorrect !== null) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    // クライアント側で正誤判定（APIリクエスト不要）
    const correctAnswer = currentQuestion.answer.trim();
    const normalizedUserAnswer = selectedAnswer.trim();
    const isAnswerCorrect = correctAnswer.toLowerCase() === normalizedUserAnswer.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    setUserAnswer(selectedAnswer);

    // 回答結果を記録
    const answerResult: AnswerResult = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect: isAnswerCorrect,
      choices: currentQuestion.choices,
      etymology: currentQuestion.etymology,
      meaning: currentQuestion.meaning,
      example: currentQuestion.example,
    };
    setAnswerResults(prev => [...prev, answerResult]);

    if (isAnswerCorrect) {
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
    if (showDetailResult) {
      // 詳細結果画面
      const correctAnswers = answerResults.filter(r => r.isCorrect);
      const incorrectAnswers = answerResults.filter(r => !r.isCorrect);
      
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>結果発表</h1>
            
            {/* 正解した問題 */}
            {correctAnswers.length > 0 && (
              <div className={styles.resultSection}>
                <h2 className={styles.resultSectionTitle}>
                  ✓ 正解 ({correctAnswers.length}問)
                </h2>
                <div className={styles.resultList}>
                  {correctAnswers.map((result, index) => (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.resultItemHeader}>
                        <span className={styles.resultNumber}>Q{index + 1}</span>
                        <span className={styles.resultStatusCorrect}>✓ 正解</span>
                      </div>
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
                <h2 className={styles.resultSectionTitle}>
                  ✗ 不正解 ({incorrectAnswers.length}問)
                </h2>
                <div className={styles.resultList}>
                  {incorrectAnswers.map((result, index) => (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.resultItemHeader}>
                        <span className={styles.resultNumber}>Q{correctAnswers.length + index + 1}</span>
                        <span className={styles.resultStatusIncorrect}>✗ 不正解</span>
                      </div>
                      <p className={styles.resultQuestion}>{result.question}</p>
                      <div className={styles.resultAnswer}>
                        <strong>あなたの回答:</strong> <span className={styles.incorrectAnswer}>{result.userAnswer}</span>
                      </div>
                      <div className={styles.resultAnswer}>
                        <strong>正解:</strong> <span className={styles.correctAnswer}>{result.correctAnswer}</span>
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
              <button className={styles.button} onClick={() => setShowDetailResult(false)}>
                サマリーに戻る
              </button>
              <button className={styles.buttonSecondary} onClick={() => {
                setSelectedTimeLimit(null);
                setShowResult(false);
                setShowDetailResult(false);
              }}>
                もう一度遊ぶ
              </button>
            </div>
          </div>
        </div>
      );
    }

    // サマリー画面
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>ゲーム終了！</h1>
          <div className={styles.scoreResult}>
            <p className={styles.scoreText}>
              正解数: {score} / {answerResults.length}
            </p>
            <p className={styles.accuracyText}>
              正答率: {answerResults.length > 0 ? Math.round((score / answerResults.length) * 100) : 0}%
            </p>
          </div>
          <div className={styles.resultActions}>
            <button className={styles.button} onClick={() => setShowDetailResult(true)}>
              詳細を見る
            </button>
            <button className={styles.buttonSecondary} onClick={() => {
              setSelectedTimeLimit(null);
              setShowResult(false);
              setShowDetailResult(false);
            }}>
              もう一度遊ぶ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              className={styles.soundToggle}
              onClick={toggleSound}
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
                  onClick={() => selectTimeLimit(30)}
                >
                  30秒
                </button>
                <button
                  className={styles.modeButton}
                  onClick={() => selectTimeLimit(60)}
                >
                  1分
                </button>
                <button
                  className={styles.modeButton}
                  onClick={() => selectTimeLimit(120)}
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
                <button className={styles.button} onClick={startGame}>
                  ゲーム開始
                </button>
                <button
                  className={styles.buttonSecondary}
                  onClick={() => setSelectedTimeLimit(null)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className={styles.questionNumber}>
            問題 {currentQuestionIndex + 1} / {questions.length}
          </div>
          <button
            className={styles.quitButton}
            onClick={handleQuit}
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
