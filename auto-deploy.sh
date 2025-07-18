#!/bin/bash

# フードパントリー管理システム v2 - 完全自動デプロイスクリプト
# Git + Clasp 自動デプロイ

set -e  # エラー時に停止

# カラー出力の設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# バナー表示
echo -e "${BLUE}"
echo "🚀 フードパントリー管理システム v2"
echo "=================================="
echo "完全自動デプロイスクリプト"
echo "Git + Clasp 自動デプロイ"
echo -e "${NC}"

# 現在時刻の取得
DEPLOY_TIME=$(date '+%Y-%m-%d %H:%M:%S')
DEPLOY_TAG="v2-$(date '+%Y%m%d-%H%M%S')"

log_info "デプロイ開始: $DEPLOY_TIME"
log_info "デプロイタグ: $DEPLOY_TAG"

# 環境確認
log_info "環境確認中..."

# Node.js確認
if ! command -v node &> /dev/null; then
    log_error "Node.js がインストールされていません"
    exit 1
fi
log_success "Node.js: $(node --version)"

# npm確認
if ! command -v npm &> /dev/null; then
    log_error "npm がインストールされていません"
    exit 1
fi
log_success "npm: $(npm --version)"

# Git確認
if ! command -v git &> /dev/null; then
    log_error "Git がインストールされていません"
    exit 1
fi
log_success "Git: $(git --version)"

# Gitリポジトリの初期化（必要な場合）
if [ ! -d ".git" ]; then
    log_info "Gitリポジトリを初期化..."
    git init
    git remote add origin https://github.com/Jumps710/foodbank.git
    log_success "Gitリポジトリ初期化完了"
fi

# 依存関係のインストール
log_info "依存関係をインストール中..."
npm install --silent
log_success "依存関係インストール完了"

# Claspの確認とインストール
if ! command -v npx clasp &> /dev/null; then
    log_info "Clasp をインストール中..."
    npm install -g @google/clasp
    log_success "Clasp インストール完了"
fi

# Claspログイン状態確認
log_info "Claspログイン状態確認中..."
if ! npx clasp login --status &> /dev/null; then
    log_error "Claspにログインしていません"
    log_info "以下のコマンドでログインしてください:"
    log_info "npx clasp login"
    exit 1
fi
log_success "Claspログイン確認完了"

# バックアップの作成
BACKUP_DIR="backup/deploy-$(date +%Y%m%d_%H%M%S)"
log_info "バックアップ作成中: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r gas-project "$BACKUP_DIR/"
cp -r src "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/"
cp README.md "$BACKUP_DIR/"
log_success "バックアップ作成完了"

# Git操作
log_info "Git操作開始..."

# 変更のステージング
git add .
log_success "変更をステージング"

# コミット
COMMIT_MESSAGE="Deploy v2 - $DEPLOY_TIME

- 管理システム v2 デプロイ
- 新しいスプレッドシート対応
- 管理画面完成
- 自動デプロイ設定

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git commit -m "$COMMIT_MESSAGE" || {
    log_warning "コミットする変更がありません"
}

# タグ作成
git tag -a "$DEPLOY_TAG" -m "Production deployment $DEPLOY_TIME"
log_success "タグ作成完了: $DEPLOY_TAG"

# GitHubにプッシュ
log_info "GitHubにプッシュ中..."
git push origin main || {
    log_info "mainブランチが存在しません。初回プッシュを実行..."
    git branch -M main
    git push -u origin main
}
git push origin "$DEPLOY_TAG"
log_success "GitHubプッシュ完了"

# Clasp操作
log_info "Clasp操作開始..."
cd gas-project

# .clasp.jsonの確認
if [ ! -f ".clasp.json" ]; then
    log_warning ".clasp.json が見つかりません"
    log_info "新しいGASプロジェクトを作成中..."
    npx clasp create --title "フードパントリー管理システム_v2" --type webapp
    log_success "新しいGASプロジェクト作成完了"
fi

# スクリプトID取得
SCRIPT_ID=$(grep -o '"scriptId": "[^"]*"' .clasp.json | cut -d'"' -f4)
log_info "スクリプトID: $SCRIPT_ID"

# Config.jsのスプレッドシートID確認
NEW_SPREADSHEET_ID=$(grep -o "NEW_SPREADSHEET_ID: '[^']*'" Config.js | cut -d"'" -f2)
if [ "$NEW_SPREADSHEET_ID" = "1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU" ]; then
    log_success "スプレッドシートID設定確認完了"
else
    log_error "スプレッドシートIDが正しく設定されていません"
    exit 1
fi

# ファイルプッシュ
log_info "GASにファイルプッシュ中..."
npx clasp push --force
log_success "ファイルプッシュ完了"

# デプロイ
log_info "Webアプリデプロイ中..."
DEPLOY_RESULT=$(npx clasp deploy --description "Auto deploy $DEPLOY_TIME - $DEPLOY_TAG")
log_success "デプロイ完了"

# デプロイURL取得
DEPLOY_URL=$(echo "$DEPLOY_RESULT" | grep -o 'https://script.google.com/macros/s/[^/]*/exec' | head -1)
if [ -n "$DEPLOY_URL" ]; then
    log_success "デプロイURL: $DEPLOY_URL"
else
    log_warning "デプロイURLを取得できませんでした"
fi

# 元のディレクトリに戻る
cd ..

# デプロイ情報の保存
log_info "デプロイ情報保存中..."
cat > deploy-info.txt << EOF
# フードパントリー管理システム v2 デプロイ情報
DEPLOY_TIME=$DEPLOY_TIME
DEPLOY_TAG=$DEPLOY_TAG
SCRIPT_ID=$SCRIPT_ID
SPREADSHEET_ID=$NEW_SPREADSHEET_ID
DEPLOY_URL=$DEPLOY_URL
GITHUB_REPO=https://github.com/Jumps710/foodbank
COMMIT_HASH=$(git rev-parse HEAD)
EOF
log_success "デプロイ情報保存完了"

# 最終確認
log_info "最終確認実行中..."
cd gas-project
npx clasp status
cd ..

# 完了メッセージ
echo ""
echo -e "${GREEN}🎉 自動デプロイ完了！${NC}"
echo "=================================="
echo -e "${GREEN}✅ 全ての処理が正常に完了しました${NC}"
echo ""
echo -e "${BLUE}📋 デプロイ情報:${NC}"
echo "   🕒 デプロイ時刻: $DEPLOY_TIME"
echo "   🏷️  デプロイタグ: $DEPLOY_TAG"
echo "   📄 スクリプトID: $SCRIPT_ID"
echo "   📊 スプレッドシートID: $NEW_SPREADSHEET_ID"
echo "   🌐 デプロイURL: $DEPLOY_URL"
echo "   📱 GitHub: https://github.com/Jumps710/foodbank"
echo ""
echo -e "${BLUE}🔗 主要なリンク:${NC}"
echo "   - 管理ダッシュボード: $DEPLOY_URL?page=admin-dashboard"
echo "   - パントリー管理: $DEPLOY_URL?page=admin-pantries"
echo "   - 予約フォーム: $DEPLOY_URL"
echo "   - スプレッドシート: https://docs.google.com/spreadsheets/d/$NEW_SPREADSHEET_ID"
echo "   - GASエディタ: https://script.google.com/d/$SCRIPT_ID"
echo ""
echo -e "${YELLOW}📝 次のステップ:${NC}"
echo "   1. 管理画面にアクセスして動作確認"
echo "   2. 既存データの表示確認"
echo "   3. 予約フォームの動作テスト"
echo "   4. メール通知の動作確認"
echo ""
echo -e "${YELLOW}⚠️  重要な注意事項:${NC}"
echo "   - 既存システムは影響を受けません"
echo "   - 問題が発生した場合は $BACKUP_DIR から復元可能"
echo "   - ログは npx clasp logs で確認できます"
echo ""
echo -e "${GREEN}🌟 デプロイ成功をお祝いします！${NC}"
echo "📞 問題があれば GitHub Issues で報告してください"
echo ""

# デプロイ完了音（可能であれば）
if command -v say &> /dev/null; then
    say "Deploy completed successfully" &
elif command -v spd-say &> /dev/null; then
    spd-say "Deploy completed successfully" &
fi

exit 0