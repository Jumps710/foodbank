# フードパントリー管理システム v2

市川市のフードパントリー予約申し込み管理システムです。Google Apps Scriptを使用したWebアプリケーションで、予約管理から利用者データベース、レポート機能まで包括的に管理できます。

## 🎯 主な機能

### 📋 予約管理機能
- **HTMLフォームによる予約受付** - Google Formからの移行
- **自動メール通知** - 予約完了時の確認メール
- **予約キャンセル機能** - 管理者による予約取り消し
- **重複予約防止** - カタカナ氏名による同一ユーザー判定

### 🏢 パントリー管理機能
- **パントリーイベント作成** - 日時、場所、定員設定
- **予約受付期間の自動制御** - 開始/終了の自動切り替え
- **容量管理** - 予約上限数の設定と監視
- **場所マスター管理** - 市役所本庁舎、ニコットなど

### 👥 利用者管理機能
- **利用者データベース** - カタカナ氏名をキーとした管理
- **利用履歴追跡** - 利用回数、初回・最終利用日の記録
- **世帯情報管理** - 世帯構成、連絡先情報の保存

### 📊 レポート・分析機能
- **利用統計ダッシュボード** - 全利用者数、利用傾向の可視化
- **期間別レポート** - 年度・月別の利用状況分析
- **CSVエクスポート** - データの外部出力機能

### 🔧 管理機能
- **管理者ダッシュボード** - システム全体の状況監視
- **イベントログ管理** - 予約作成、エラー等の記録
- **設定管理** - システム設定の変更

## 🚀 技術スタック

- **フロントエンド**: HTML, CSS (Bootstrap 5), JavaScript
- **バックエンド**: Google Apps Script (JavaScript)
- **データベース**: Google Sheets
- **認証**: Google アカウント
- **通知**: Gmail API
- **デプロイ**: Google Apps Script Web App, Clasp

## 📁 プロジェクト構成

```
foodbank/
├── gas-project/                 # GASプロジェクトファイル
│   ├── Code.js                 # メインルーティング
│   ├── Config.js               # 設定・マスターデータ
│   ├── PantryService.js        # パントリー管理サービス
│   ├── ReservationService.js   # 予約管理サービス
│   ├── UserService.js          # ユーザー管理サービス
│   ├── LogService.js           # ログ管理サービス
│   ├── ReservationForm.html    # 予約フォーム
│   ├── AdminDashboard.html     # 管理ダッシュボード
│   ├── PantryManagement.html   # パントリー管理画面
│   ├── appsscript.json         # GAS設定
│   └── .clasp.json             # Clasp設定
├── backup/                     # バックアップファイル
├── docs/                       # ドキュメント
├── mockups/                    # モックアップファイル
├── package.json                # プロジェクト設定
├── initialize-spreadsheet.js   # スプレッドシート初期化
├── SETUP_INSTRUCTIONS.md       # セットアップ手順
├── DEPLOYMENT_GUIDE.md         # デプロイ手順
└── README.md                   # このファイル
```

## 🔧 セットアップ

### 前提条件
- Node.js 14.0.0以上
- Google アカウント
- Google Apps Script API の有効化

### 1. リポジトリのクローン
```bash
git clone https://github.com/Jumps710/foodbank.git
cd foodbank
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. スプレッドシートの初期化
1. Google Apps Script (https://script.google.com) にアクセス
2. `initialize-spreadsheet.js` の内容をコピー&ペースト
3. `runInitialization()` を実行

### 4. Claspの設定
```bash
# Googleアカウントでログイン
npx clasp login

# 新しいGASプロジェクトを作成
npm run init-project
```

### 5. デプロイ
```bash
# ファイルをアップロード
npm run push

# Webアプリとしてデプロイ
npm run deploy
```

詳細な手順は `SETUP_INSTRUCTIONS.md` をご参照ください。

## 📊 データ構造

### スプレッドシート構成
- **Pantries_v2**: パントリーイベント情報
- **Users_v2**: 利用者データベース
- **Reservations_v2**: 予約データ
- **UsageHistory_v2**: 利用履歴
- **EventLogs_v2**: システムログ
- **Admins_v2**: 管理者情報
- **Settings_v2**: システム設定

### 主要なIDフォーマット
- **パントリーID**: `YY.MM.DD.場所` (例: `25.01.18.ニコット`)
- **予約ID**: `YYMMDDNNN` (例: `25011800１`)
- **ユーザーID**: `USR` + 連番 (例: `USR001`)

## 🔒 セキュリティ

### 現在の実装
- 基本的な入力検証
- スプレッドシートアクセス制御
- ログ記録機能

### 推奨セキュリティ対策
- 管理者認証の実装
- API制限の設定
- 定期的なバックアップ
- アクセスログの監視

## 🚨 重要な注意事項

### 既存システムとの関係
- **既存のGoogle Formとスプレッドシート**: `1zbbxjtNU2DOl-xXlOnkHyI2uRmzKaMGLlwgD8rUrdJQ`
- **新システムのスプレッドシート**: `1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU`
- 既存システムは読み取り専用として参照のみ
- 新システムは完全に独立して動作

### 移行時の注意
1. 既存システムのバックアップを必ず取得
2. 新システムでの十分なテストを実施
3. 段階的な移行を推奨
4. 利用者への事前通知

## 🛠️ 開発・メンテナンス

### よく使用するコマンド
```bash
# 開発中の更新
npm run push

# 本番デプロイ
npm run deploy

# ログの確認
npm run logs

# GASエディタを開く
npm run open

# プロジェクトの状態確認
npm run status
```

### トラブルシューティング
問題が発生した場合は以下を確認：
1. Google Apps Script APIの有効化状況
2. スプレッドシートのアクセス権限
3. Claspの認証状態
4. システムログの確認

## 📝 ライセンス

MIT License

## 👥 コントリビューター

- Food Pantry Management Team

## 📞 サポート

システムに関するお問い合わせは、プロジェクトのIssuesまでお願いします。

---

**🌟 このシステムが地域の食料支援活動に貢献できることを願っています 🌟**