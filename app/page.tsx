'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Question, AnswerResult, GameMode, GameConfig } from './types';
import { useSound } from './hooks/useSound';
import LoadingScreen from './components/LoadingScreen';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultSummary from './components/ResultSummary';
import ResultDetail from './components/ResultDetail';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showDetailResult, setShowDetailResult] = useState(false);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { soundEnabled, toggleSound, startBGM, playCorrectSound, playIncorrectSound } = useSound();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    // タイムアタックモードの場合のみタイマーを動作させる
    if (isGameActive && gameConfig?.mode === 'timeAttack' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameActive && gameConfig?.mode === 'timeAttack' && timeLeft === 0) {
      endGame();
    }
  }, [isGameActive, timeLeft, gameConfig]);

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setUserAnswer('');
    setIsCorrect(null);
  }, [currentQuestionIndex]);

  // 正解/不正解時に効果音を再生
  const prevIsCorrectRef = useRef<boolean | null>(null);
  useEffect(() => {
    // 前回がnullで、今回がtrue/falseに変わった時だけ再生
    if (prevIsCorrectRef.current === null && isCorrect !== null) {
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    }
    prevIsCorrectRef.current = isCorrect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectMode = (mode: GameMode | null, timeLimit?: number) => {
    if (mode === null) {
      setGameConfig(null);
      return;
    }
    if (mode === 'timeAttack' && timeLimit) {
      setGameConfig({ mode, timeLimit });
    } else if (mode === 'timeAttack') {
      setGameConfig({ mode });
    } else {
      setGameConfig({ mode });
    }
  };

  const startGame = () => {
    if (questions.length === 0 || !gameConfig) return;
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(gameConfig.timeLimit || 0);
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
      setGameConfig(null);
      setShowResult(false);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(60);
      setUserAnswer('');
      setIsCorrect(null);
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
      // サドンデスモードの場合、不正解で即終了
      if (gameConfig?.mode === 'suddenDeath') {
        setTimeout(() => {
          endGame();
        }, 3500);
      } else {
        setTimeout(() => {
          nextQuestion();
        }, 3500);
      }
    }
  };

  const nextQuestion = () => {
    // エンドレスモードの場合は問題をループ
    if (gameConfig?.mode === 'endless') {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // 問題が終わったら最初に戻る
        setCurrentQuestionIndex(0);
      }
      setUserAnswer('');
      setIsCorrect(null);
    } else {
      // タイムアタックモードとサドンデスモードは通常通り
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer('');
        setIsCorrect(null);
      } else {
        endGame();
      }
    }
  };

  const handleRestart = () => {
    setGameConfig(null);
    setShowResult(false);
    setShowDetailResult(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showResult) {
    if (showDetailResult) {
      return (
        <ResultDetail
          answerResults={answerResults}
          onBackToSummary={() => setShowDetailResult(false)}
          onRestart={handleRestart}
        />
      );
    }

    return (
      <ResultSummary
        score={score}
        totalQuestions={answerResults.length}
        onShowDetail={() => setShowDetailResult(true)}
        onRestart={handleRestart}
      />
    );
  }

  if (!isGameActive) {
    return (
      <StartScreen
        gameConfig={gameConfig}
        soundEnabled={soundEnabled}
        onSelectMode={selectMode}
        onStartGame={startGame}
        onToggleSound={toggleSound}
        onStartBGM={startBGM}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <GameScreen
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={questions.length}
      timeLeft={gameConfig?.mode === 'timeAttack' ? timeLeft : null}
      score={score}
      userAnswer={userAnswer}
      isCorrect={isCorrect}
      soundEnabled={soundEnabled}
      gameMode={gameConfig?.mode || 'timeAttack'}
      onAnswerClick={handleAnswerClick}
      onQuit={handleQuit}
      onToggleSound={toggleSound}
    />
  );
}
