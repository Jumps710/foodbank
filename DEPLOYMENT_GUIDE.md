# デプロイメントガイド

## 概要
フードパントリー管理システム v2 のデプロイメント手順について説明します。

## 前提条件
- Node.js 14.0.0以上がインストールされている
- Google Apps Script APIが有効化されている
- Googleアカウントでログインしている

## 手順

### 1. 環境の準備

#### a) 依存関係のインストール
```bash
npm install
```

#### b) Claspの設定
```bash
# 初回のみ実行
npm run setup

# Googleアカウントでログイン
npx clasp login
```

### 2. 新しいスプレッドシートの作成

#### a) セットアップスクリプトの実行
```bash
# setup-new-spreadsheet.js を Google Apps Script で実行
# 新しいスプレッドシートIDを取得
```

#### b) 設定ファイルの更新
`gas-project/Config.js` の以下の行を更新：
```javascript
NEW_SPREADSHEET_ID: 'YOUR_NEW_SPREADSHEET_ID',
```

### 3. GASプロジェクトの作成・設定

#### a) 新しいGASプロジェクトの作成
```bash
npm run init-project
```

#### b) .clasp.jsonの更新
作成されたスクリプトIDを確認し、`gas-project/.clasp.json`を更新：
```json
{
  "scriptId": "YOUR_NEW_SCRIPT_ID",
  "rootDir": "."
}
```

### 4. ファイルのデプロイ

#### a) ファイルのアップロード
```bash
npm run push
```

#### b) Webアプリとしてデプロイ
```bash
npm run deploy
```

### 5. 初期設定

#### a) スプレッドシートの初期化
GASエディタで以下を実行：
```javascript
initializeNewSpreadsheet();
```

#### b) 設定の確認
```bash
npm run status
```

## 本番環境への移行

### 1. 既存システムのバックアップ
- 現在のスプレッドシートを複製
- 既存のGASプロジェクトをバックアップ

### 2. 新システムのテスト
- 予約フォームの動作確認
- 管理画面の動作確認
- メール送信機能の確認

### 3. 段階的な切り替え
1. 新システムを並行稼働させる
2. 予約者に新システムのURLを案内
3. 既存システムの段階的停止

### 4. 最終確認
- 全機能の動作確認
- データの整合性確認
- バックアップの完全性確認

## メンテナンス

### 日常メンテナンス
```bash
# ログの確認
npm run logs

# 最新版の取得
npm run pull

# 更新のデプロイ
npm run deploy
```

### トラブルシューティング

#### よくある問題と解決方法

1. **デプロイエラー**
   - `npx clasp login` でログイン状態を確認
   - Google Apps Script APIの有効化を確認

2. **スプレッドシートアクセスエラー**
   - スプレッドシートIDが正しいか確認
   - 権限設定を確認

3. **メール送信エラー**
   - Gmail APIの制限を確認
   - メールアドレスの形式を確認

## セキュリティ注意事項

- スクリプトIDやスプレッドシートIDを公開しない
- 本番環境では必ず認証機能を有効化
- 定期的なバックアップを実施
- ログの監視を継続

## サポート・問い合わせ

問題が発生した場合は以下を確認してください：

1. ログファイルの確認
2. エラーメッセージの記録
3. 実行環境の確認
4. 最新バージョンの確認

緊急時の連絡先：[管理者メールアドレス]