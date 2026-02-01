# YOKOMOJI

「YOKOMOJI」は Next.js と TypeScript で作成されたシンプルな早押しクイズゲームです。

## 機能

- 制限時間 1 分で問題に答える早押しゲーム
- MySQL データベースまたは JSON ファイルから問題を読み込み（環境変数で切り替え可能）
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
USE_DATABASE=true
```

**環境変数の説明：**

- `USE_DATABASE=true`: MySQL データベースを使用（ローカル開発環境）
- `USE_DATABASE=false` または未設定: JSON ファイルを使用（Vercel などのサーバーレス環境）

### 3. Docker Compose で MySQL を起動（USE_DATABASE=true の場合のみ）

```bash
docker compose up -d
```

### 4. データベースのマイグレーションとシード（USE_DATABASE=true の場合のみ）

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

## Vercel へのデプロイ

Vercel にデプロイする場合、環境変数 `USE_DATABASE` を設定しないか、`false` に設定してください。これにより、`data/questions.json` ファイルから問題を読み込みます（外部データベースサービスは不要です）。

## 技術スタック

- Next.js 14
- TypeScript
- MySQL 8.0（オプション）
- Docker Compose（オプション）
- React 18
