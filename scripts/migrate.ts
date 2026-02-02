import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// .env.localファイルを読み込む
config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'hayaoshi_user',
    password: process.env.DB_PASSWORD || 'hayaoshi_password',
    database: process.env.DB_NAME || 'hayaoshi',
    multipleStatements: true,
  });

  try {
    // 既存のテーブルを削除（開発環境用）
    await connection.query('DROP TABLE IF EXISTS questions');

    // テーブル作成
    await connection.query(`
      CREATE TABLE questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer VARCHAR(255) NOT NULL,
        choices JSON NOT NULL,
        etymology TEXT,
        meaning TEXT NOT NULL,
        example TEXT,
        category VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
