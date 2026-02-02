import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import pool from '@/lib/db';

// 動的レンダリングを強制（毎回シャッフルされるように）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

// JSONファイルから問題を読み込む（カテゴリーごとのファイルから）
function loadQuestionsFromJson() {
  const categoriesDir = path.join(process.cwd(), 'data', 'categories');
  const categoryFiles = fs.readdirSync(categoriesDir).filter((file: string) => file.endsWith('.json'));
  
  let allQuestions: any[] = [];
  let idCounter = 1;

  // 各カテゴリーファイルを読み込む
  categoryFiles.forEach((file: string) => {
    const filePath = path.join(categoriesDir, file);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileData);
    
    // 各問題にidを追加
    const questionsWithId = questions.map((q: any) => ({
      id: idCounter++,
      question: q.question,
      answer: q.answer,
      choices: q.choices,
      etymology: q.etymology,
      meaning: q.meaning,
      example: q.example,
      category: q.category
    }));
    
    allQuestions = allQuestions.concat(questionsWithId);
  });

  // 問題をシャッフル
  const shuffledQuestions = shuffleQuestions(allQuestions);

  // 各問題の選択肢をシャッフル
  return shuffledQuestions.map((q: any) => ({
    ...q,
    choices: shuffleArray(q.choices)
  }));
}

// データベースから問題を読み込む
async function loadQuestionsFromDB() {
  const [rows] = (await pool.query(
    'SELECT id, question, answer, choices, etymology, meaning, example, category FROM questions ORDER BY RAND()'
  )) as any[];

  // JSON形式のchoicesをパースしてシャッフル
  const questions = rows.map((row: any) => {
    const choices = typeof row.choices === 'string' ? JSON.parse(row.choices) : row.choices;
    return {
      ...row,
      choices: shuffleArray(choices)
    };
  });

  return questions;
}

export async function GET() {
  try {
    const useDatabase = process.env.USE_DATABASE === 'true';

    let questions;
    if (useDatabase) {
      questions = await loadQuestionsFromDB();
    } else {
      questions = loadQuestionsFromJson();
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to load questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
