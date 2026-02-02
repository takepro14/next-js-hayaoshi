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

    // カテゴリーごとのJSONファイルから問題データを読み込む
    const categoriesDir = path.resolve(process.cwd(), 'data', 'categories');
    const categoryFiles = fs.readdirSync(categoriesDir).filter((file: string) => file.endsWith('.json'));
    
    let totalQuestions = 0;

    // 各カテゴリーファイルを読み込む
    for (const file of categoryFiles) {
      const filePath = path.join(categoriesDir, file);
      const fileData = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(fileData);

      for (const q of questions) {
        await connection.query(
          'INSERT INTO questions (question, answer, choices, etymology, meaning, example, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            q.question,
            q.answer,
            JSON.stringify(q.choices),
            q.etymology,
            q.meaning,
            q.example,
            q.category || null
          ]
        );
        totalQuestions++;
      }
    }

    console.log(`Seeded ${totalQuestions} questions successfully!`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
