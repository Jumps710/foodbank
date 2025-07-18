#!/bin/bash

# フードパントリー管理システム v2 デプロイスクリプト
# 本番環境への安全なデプロイを実行

echo "🚀 フードパントリー管理システム v2 デプロイ開始"
echo "=================================="

# 現在の作業ディレクトリを確認
echo "📁 現在のディレクトリ: $(pwd)"

# 必要なファイルの存在確認
echo "📋 必要なファイルの確認..."
REQUIRED_FILES=(
  "gas-project/Code.js"
  "gas-project/Config.js"
  "gas-project/PantryService.js"
  "gas-project/ReservationService.js"
  "gas-project/UserService.js"
  "gas-project/LogService.js"
  "gas-project/ReservationForm.html"
  "gas-project/AdminDashboard.html"
  "gas-project/PantryManagement.html"
  "gas-project/appsscript.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file が見つかりません"
    exit 1
  fi
done

# Node.js とnpmの確認
echo "🔧 環境確認..."
if command -v node &> /dev/null; then
  echo "✅ Node.js: $(node --version)"
else
  echo "❌ Node.js がインストールされていません"
  exit 1
fi

if command -v npm &> /dev/null; then
  echo "✅ npm: $(npm --version)"
else
  echo "❌ npm がインストールされていません"
  exit 1
fi

# 依存関係のインストール
echo "📦 依存関係のインストール..."
npm install

# Claspのインストール確認
if ! command -v npx clasp &> /dev/null; then
  echo "🔧 Clasp をインストールしています..."
  npm install -g @google/clasp
fi

# Claspのログイン状態確認
echo "🔐 Claspのログイン状態確認..."
cd gas-project
if npx clasp login --status &> /dev/null; then
  echo "✅ Claspにログイン済み"
else
  echo "❌ Claspにログインしていません"
  echo "📝 以下のコマンドでログインしてください:"
  echo "   npx clasp login"
  exit 1
fi

# .clasp.json の確認
if [ -f ".clasp.json" ]; then
  SCRIPT_ID=$(grep -o '"scriptId": "[^"]*"' .clasp.json | cut -d'"' -f4)
  if [ "$SCRIPT_ID" != "PLACEHOLDER_NEW_SCRIPT_ID" ]; then
    echo "✅ スクリプトID設定済み: $SCRIPT_ID"
  else
    echo "❌ スクリプトIDが設定されていません"
    echo "📝 以下のコマンドで新しいプロジェクトを作成してください:"
    echo "   npx clasp create --title 'フードパントリー管理システム_v2' --type webapp"
    exit 1
  fi
else
  echo "❌ .clasp.json が見つかりません"
  exit 1
fi

# Config.jsのスプレッドシートID確認
echo "📊 スプレッドシートID確認..."
NEW_SPREADSHEET_ID=$(grep -o "NEW_SPREADSHEET_ID: '[^']*'" Config.js | cut -d"'" -f2)
if [ "$NEW_SPREADSHEET_ID" = "1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU" ]; then
  echo "✅ 新しいスプレッドシートID設定済み"
else
  echo "❌ スプレッドシートIDが正しく設定されていません"
  echo "📝 Config.jsのNEW_SPREADSHEET_IDを確認してください"
  exit 1
fi

# バックアップの作成
echo "💾 デプロイ前バックアップ作成..."
BACKUP_DIR="../backup/deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
echo "✅ バックアップ作成完了: $BACKUP_DIR"

# ファイルのプッシュ
echo "📤 ファイルをGoogle Apps Scriptにプッシュ..."
if npx clasp push; then
  echo "✅ ファイルプッシュ成功"
else
  echo "❌ ファイルプッシュ失敗"
  exit 1
fi

# Webアプリとしてデプロイ
echo "🌐 Webアプリとしてデプロイ..."
DEPLOY_RESULT=$(npx clasp deploy --description "フードパントリー管理システム v2 - $(date '+%Y-%m-%d %H:%M:%S')")
if [ $? -eq 0 ]; then
  echo "✅ デプロイ成功"
  echo "$DEPLOY_RESULT"
  
  # デプロイURLの抽出
  DEPLOY_URL=$(echo "$DEPLOY_RESULT" | grep -o 'https://script.google.com/macros/s/[^/]*/exec')
  if [ -n "$DEPLOY_URL" ]; then
    echo "🌐 デプロイURL: $DEPLOY_URL"
    
    # URL情報をファイルに保存
    echo "DEPLOY_URL=$DEPLOY_URL" > ../deploy-info.txt
    echo "DEPLOY_DATE=$(date)" >> ../deploy-info.txt
    echo "SCRIPT_ID=$SCRIPT_ID" >> ../deploy-info.txt
    echo "SPREADSHEET_ID=$NEW_SPREADSHEET_ID" >> ../deploy-info.txt
  fi
else
  echo "❌ デプロイ失敗"
  exit 1
fi

# プロジェクトの状態確認
echo "📋 プロジェクト状態確認..."
npx clasp status

# 最終確認メッセージ
echo ""
echo "🎉 デプロイ完了!"
echo "=================================="
echo "✅ 全ての処理が正常に完了しました"
echo ""
echo "📋 次のステップ:"
echo "1. デプロイされたWebアプリにアクセス"
echo "2. 管理画面の動作確認"
echo "3. 予約フォームの動作確認"
echo "4. データの表示確認"
echo ""
echo "🔗 重要なリンク:"
echo "   - デプロイURL: $DEPLOY_URL"
echo "   - スプレッドシート: https://docs.google.com/spreadsheets/d/$NEW_SPREADSHEET_ID"
echo "   - GASエディタ: https://script.google.com/d/$SCRIPT_ID"
echo ""
echo "⚠️  注意事項:"
echo "   - 管理画面へのアクセス時は認証が必要です"
echo "   - 既存システムは影響を受けません"
echo "   - 問題が発生した場合はバックアップから復元可能です"
echo ""
echo "📞 サポート: GitHub Issues で問題を報告してください"
echo "🌟 デプロイ成功をお祝いします！"

cd ..