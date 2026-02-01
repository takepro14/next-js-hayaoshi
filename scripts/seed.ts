import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import * as path from 'path';

// .env.localファイルを読み込む
config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'hayaoshi_user',
    password: process.env.DB_PASSWORD || 'hayaoshi_password',
    database: process.env.DB_NAME || 'hayaoshi',
  });

  try {
    // 既存のデータを削除
    await connection.query('DELETE FROM questions');

    // 初期問題データ
    const questions = [
      { question: '日本の首都は？', answer: '東京' },
      { question: '1+1は？', answer: '2' },
      { question: '世界で一番高い山は？', answer: 'エベレスト' },
      { question: 'リンゴを英語で？', answer: 'apple' },
      { question: '日本の国花は？', answer: '桜' },
      { question: '太陽系の惑星の数は？', answer: '8' },
      { question: '日本の人口は約何億人？', answer: '1.2' },
      { question: '1週間は何日？', answer: '7' },
      { question: '日本の最高峰は？', answer: '富士山' },
      { question: '水の化学式は？', answer: 'H2O' },
    ];

    for (const q of questions) {
      await connection.query(
        'INSERT INTO questions (question, answer) VALUES (?, ?)',
        [q.question, q.answer]
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
