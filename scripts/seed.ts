import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// .env.localファイルを読み込む
config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'hayaoshi_user',
    password: process.env.DB_PASSWORD || 'hayaoshi_password',
    database: process.env.DB_NAME || 'hayaoshi'
  });

  try {
    // 既存のデータを削除
    await connection.query('DELETE FROM questions');

    // JSONファイルから問題データを読み込む
    const questionsPath = path.resolve(process.cwd(), 'data', 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(questionsData);

    for (const q of questions) {
      await connection.query(
        'INSERT INTO questions (question, answer, choices, etymology, meaning, example) VALUES (?, ?, ?, ?, ?, ?)',
        [
          q.question,
          q.answer,
          JSON.stringify(q.choices),
          q.etymology,
          q.meaning,
          q.example
        ]
      );
    }

    console.log(`Seeded ${questions.length} questions successfully!`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
