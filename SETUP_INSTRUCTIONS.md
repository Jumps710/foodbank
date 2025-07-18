# フードパントリー管理システム v2 セットアップ手順

## 重要：既存システムへの影響について
この新システムは既存のGASプロジェクトとスプレッドシートに**一切影響を与えません**。
- 既存のGASプロジェクト（script.google.com上）は変更されません
- 既存のスプレッドシート（ID: 1zbbxjtNU2DOl-xXlOnkHyI2uRmzKaMGLlwgD8rUrdJQ）は読み取り専用として参照のみ
- 新システムは完全に独立したスプレッドシートとGASプロジェクトを使用

## セットアップ手順

### 1. 新しいスプレッドシートの作成

1. Google Apps Script（https://script.google.com）にアクセス
2. 新しいプロジェクトを作成
3. `setup-new-spreadsheet.js` の内容をコピー&ペースト
4. `runSetup()` 関数を実行
5. 実行結果で表示されるスプレッドシートIDをメモ

### 2. Config.jsの更新

1. `gas-project/Config.js` を開く
2. 15行目の `NEW_SPREADSHEET_ID: null` を作成されたIDに変更
   ```javascript
   NEW_SPREADSHEET_ID: 'ここに新しいスプレッドシートIDを入力',
   ```

### 3. GASプロジェクトのデプロイ

1. Google Apps Scriptで新しいプロジェクトを作成
2. `gas-project/` フォルダ内の全ファイルをアップロード
3. Webアプリとしてデプロイ
4. デプロイURLを確認

### 4. 動作確認

1. デプロイされたWebアプリにアクセス
2. 予約フォームの動作確認
3. 管理画面へのアクセス確認
4. 新しいスプレッドシートへのデータ保存確認

## 現在の実装状況

### ✅ 完了済み
- Core services (PantryService, ReservationService, UserService, LogService)
- データベース設計とシート構造
- 予約フォームHTML
- 予約処理とメール送信機能
- 基本的なAPI endpoints

### 🔄 実装中
- 管理画面のHTML
- ダッシュボード機能
- レポート機能

### 📋 未実装
- 認証システム
- Claspでの自動デプロイ
- 既存データの移行ツール

## ファイル構成

```
gas-project/
├── Code.js              # メインのルーティング
├── Config.js            # 設定とマスターデータ
├── PantryService.js     # パントリー管理
├── ReservationService.js # 予約管理
├── UserService.js       # ユーザー管理
├── LogService.js        # ログ管理
├── ReservationForm.html # 予約フォーム
├── AdminDashboard.html  # 管理画面（未完成）
├── PantryManagement.html # パントリー管理画面（未完成）
└── appsscript.json      # GAS設定
```

## 注意事項

1. **既存システムの保護**
   - 既存のGASプロジェクトは絶対に変更しないでください
   - 新システムは完全に独立して動作します

2. **データの二重管理**
   - 移行期間中は既存システムも並行稼働可能
   - 新システムでのテスト完了後に切り替え

3. **バックアップ**
   - 作業前に必ずバックアップを取得
   - `backup/` フォルダに保存済み

## 次のステップ

1. 新しいスプレッドシートの作成
2. 管理画面の実装完了
3. テスト環境での動作確認
4. 本番環境への移行計画