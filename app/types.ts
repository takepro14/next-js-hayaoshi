export interface Question {
  id: number;
  question: string;
  answer: string;
  choices: string[];
  etymology?: string;
  meaning: string;
  example?: string;
}

export interface AnswerResult {
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

export type GameMode = 'timeAttack' | 'suddenDeath' | 'endless';

export interface GameConfig {
  mode: GameMode;
  timeLimit?: number; // タイムアタックモードの場合のみ
}
