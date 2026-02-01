import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'hayaoshi_user',
  password: process.env.DB_PASSWORD || 'hayaoshi_password',
  database: process.env.DB_NAME || 'hayaoshi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
