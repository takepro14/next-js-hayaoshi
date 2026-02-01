import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { questionId, userAnswer } = await request.json();

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      'SELECT answer FROM questions WHERE id = ?',
      [questionId]
    ) as any[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const correctAnswer = rows[0].answer.trim();
    const normalizedUserAnswer = userAnswer.trim();

    // 4択形式なので、大文字小文字を区別せずに比較
    const isCorrect = correctAnswer.toLowerCase() === normalizedUserAnswer.toLowerCase();

    return NextResponse.json({ correct: isCorrect });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}
