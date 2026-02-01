import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import pool from '@/lib/db';

// JSONファイルから問題を取得
function getQuestionFromJson(questionId: number) {
  const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
  const questionsData = fs.readFileSync(questionsPath, 'utf8');
  const questions = JSON.parse(questionsData);
  
  // questionIdで問題を検索（idは1ベースのインデックス）
  return questions[questionId - 1];
}

// データベースから問題を取得
async function getQuestionFromDB(questionId: number) {
  const [rows] = await pool.query(
    'SELECT answer FROM questions WHERE id = ?',
    [questionId]
  ) as any[];

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

export async function POST(request: NextRequest) {
  try {
    const { questionId, userAnswer } = await request.json();

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const useDatabase = process.env.USE_DATABASE === 'true';
    
    let question;
    if (useDatabase) {
      question = await getQuestionFromDB(questionId);
    } else {
      question = getQuestionFromJson(questionId);
    }

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
