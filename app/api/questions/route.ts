import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fisher-Yatesアルゴリズムで配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, question, answer, choices, etymology, meaning, example FROM questions ORDER BY RAND()'
    ) as any[];
    
    // JSON形式のchoicesをパースしてシャッフル
    const questions = rows.map((row: any) => {
      const choices = typeof row.choices === 'string' ? JSON.parse(row.choices) : row.choices;
      return {
        ...row,
        choices: shuffleArray(choices)
      };
    });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
