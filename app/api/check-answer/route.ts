import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { questionId, userAnswer } = await request.json();

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // JSONファイルから問題を読み込む
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);
    
    // questionIdで問題を検索（idは1ベースのインデックス）
    const question = questions[questionId - 1];

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const correctAnswer = question.answer.trim();
    const normalizedUserAnswer = userAnswer.trim();

    // 4択形式なので、大文字小文字を区別せずに比較
    const isCorrect = correctAnswer.toLowerCase() === normalizedUserAnswer.toLowerCase();

    return NextResponse.json({ correct: isCorrect });
  } catch (error) {
    console.error('Failed to check answer:', error);
    return NextResponse.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}
