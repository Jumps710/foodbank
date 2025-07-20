# GAS Web App デプロイメント権限設定

## 🚨 重要: 手動設定が必要

新しいデプロイメントID: `AKfycbxoxcsdOFSe0a_XiT-cLlGtTiJSo6KEGxaNfjKaCDHlxltN7t5W0xqtGoSyf5N-miVLaw`

## 設定手順

### 1. Google Apps Script Editor にアクセス
https://script.google.com/d/1zbbxjtNU2DOl-xXlOnkHyI2uRmzKaMGLlwgD8rUrdJQ/edit

### 2. デプロイ設定
1. **「デプロイ」** → **「デプロイを管理」** をクリック
2. **最新のデプロイメント (v5)** を選択
3. **設定を変更**:
   - **種類**: Web アプリ
   - **説明**: Public API deployment with CORS support  
   - **実行ユーザー**: 自分（あなたのGoogleアカウント）
   - **アクセスできるユーザー**: **誰でも** ← **重要！**

### 3. 権限の承認
- Googleアカウントでの権限承認が求められた場合は許可
- スプレッドシートアクセス権限を許可

### 4. URLの確認
新しいWeb AppのURL:
```
https://script.google.com/macros/s/AKfycbxoxcsdOFSe0a_XiT-cLlGtTiJSo6KEGxaNfjKaCDHlxltN7t5W0xqtGoSyf5N-miVLaw/exec
```

## ❌ 現在の問題
- 現在のデプロイメントは認証が必要な設定になっている
- そのため302リダイレクトでGoogleログインページに転送される
- CORS以前の問題として、APIアクセス自体ができない状態

## ✅ 設定完了後
設定完了後は以下をテスト:
```bash
curl "https://script.google.com/macros/s/AKfycbxoxcsdOFSe0a_XiT-cLlGtTiJSo6KEGxaNfjKaCDHlxltN7t5W0xqtGoSyf5N-miVLaw/exec?action=getStatistics"
```

正常な場合はJSONレスポンスが返る