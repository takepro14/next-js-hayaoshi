import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Fisher-Yatesアルゴリズムで配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 配列をランダムにシャッフル
function shuffleQuestions<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  try {
    // JSONファイルから問題を読み込む
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    
    // 各問題に元のインデックス+1をidとして追加（シャッフル前のインデックス）
    const questionsWithId = questions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question,
      answer: q.answer,
      choices: q.choices,
      etymology: q.etymology,
      meaning: q.meaning,
      example: q.example,
    }));
    
    // 問題をシャッフル
    const shuffledQuestions = shuffleQuestions(questionsWithId);
    
    // 各問題の選択肢をシャッフル
    const finalQuestions = shuffledQuestions.map((q: any) => ({
      ...q,
      choices: shuffleArray(q.choices),
    }));
    
    return NextResponse.json(finalQuestions);
  } catch (error) {
    console.error('Failed to load questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
