# 早押しゲーム

Next.js と TypeScript で作成されたシンプルな早押しクイズゲームです。

## 機能

- 制限時間 30 秒で問題に答える早押しゲーム
- MySQL データベースに問題を保存
- Docker Compose で開発環境を構築
- シンプルで使いやすい UI

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=hayaoshi_user
DB_PASSWORD=hayaoshi_password
DB_NAME=hayaoshi
```

### 3. Docker Compose で MySQL を起動

```bash
docker compose up -d
```

### 4. データベースのマイグレーションとシード

```bash
npm run db:migrate
npm run db:seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run db:migrate` - データベースマイグレーション実行
- `npm run db:seed` - 初期データの投入

## 技術スタック

- Next.js 14
- TypeScript
- MySQL 8.0
- Docker Compose
- React 18
