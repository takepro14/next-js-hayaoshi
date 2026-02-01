import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, question, answer, choices, etymology, meaning, example FROM questions ORDER BY RAND()'
    ) as any[];
    
    // JSON形式のchoicesをパース
    const questions = rows.map((row: any) => ({
      ...row,
      choices: typeof row.choices === 'string' ? JSON.parse(row.choices) : row.choices
    }));
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
