# Firebase - Netlify設定手順

## 🚨 重要: Firebase承認済みドメインの追加が必要

### 1. Firebase Console にアクセス
https://console.firebase.google.com/project/foodbank-management/authentication/settings

### 2. 承認済みドメインの設定
1. **Authentication** → **Settings** → **承認済みドメイン** タブ
2. **ドメインを追加**をクリック
3. **`ichikawa-foodbank.netlify.app`** を追加
4. **保存**

### 3. 現在の承認済みドメイン一覧
確認すべきドメイン：
- ✅ `localhost` (開発用)
- ✅ `jumps710.github.io` (GitHub Pages)
- ⚠️ `ichikawa-foodbank.netlify.app` (追加が必要)

### 4. CSP (Content Security Policy) エラー対策
`netlify.toml` で以下を許可済み：
- `https://apis.google.com` - Google API
- `https://accounts.google.com` - Google認証
- `https://firebase.googleapis.com` - Firebase API
- `https://foodbank-management.firebaseapp.com` - Firebase プロジェクト

### 5. テスト手順
1. Firebase承認済みドメイン追加後
2. Netlifyでサイト再デプロイ
3. https://ichikawa-foodbank.netlify.app/admin.html でGoogle認証テスト

### 6. 想定されるエラーと対策

#### CSPエラー
```
Refused to load the script 'https://apis.google.com/js/api.js'
```
→ `netlify.toml` でドメイン許可済み

#### 承認されていないドメインエラー
```
Firebase: Error (auth/unauthorized-domain)
```
→ Firebase Console で承認済みドメイン追加が必要

#### 内部エラー
```
Firebase: Error (auth/internal-error)
```
→ 通常はCSPまたは承認済みドメインの問題

## 🔧 トラブルシューティング

### 問題: Google認証が失敗する
1. Firebase Console で承認済みドメイン確認
2. 開発者ツールでCSPエラー確認
3. Network タブで API リクエスト確認

### 問題: CSPエラーが継続する
1. Netlifyでサイト再デプロイ
2. ブラウザキャッシュクリア
3. 開発者ツールでResponse Headers確認