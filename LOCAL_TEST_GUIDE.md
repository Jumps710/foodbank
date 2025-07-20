# ローカルテスト環境セットアップガイド

## 1. Firebase Console 設定

### 承認済みドメインの追加
1. https://console.firebase.google.com/project/foodbank-management/authentication/settings
2. ページ下部の「承認済みドメイン」セクション
3. 「ドメインを追加」をクリック
4. 以下を追加:
   - `localhost`
   - `127.0.0.1`
   - `jumps710.github.io`

## 2. ローカルサーバーの起動

### Windows の場合
```cmd
# プロジェクトディレクトリで実行
start-local-server.bat
```

### Mac/Linux の場合
```bash
# プロジェクトディレクトリで実行
./start-local-server.sh
```

### 手動でPythonサーバーを起動
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

## 3. アクセスURL

- **メインサイト**: http://localhost:8000/
- **管理画面**: http://localhost:8000/admin.html
- **Firebase テストページ**: http://localhost:8000/firebase-test.html

## 4. トラブルシューティング

### "Failed to fetch" エラー
- Firebase Console で承認済みドメインに `localhost` が追加されているか確認
- ブラウザのデベロッパーツールでネットワークエラーの詳細を確認
- ブラウザのキャッシュをクリア

### ポート競合エラー
- 別のポートを使用: `python -m http.server 3000`
- 既存のサーバープロセスを終了

### Firebase初期化エラー
- ブラウザのコンソールでエラーメッセージを確認
- Firebaseプロジェクト設定が正しいか確認
- インターネット接続を確認

## 5. 本番環境との違い

- ローカル環境では `localhost` ドメインを使用
- Firebase の appVerificationDisabledForTesting が有効
- HTTPS ではなく HTTP を使用（開発用のみ）

## 6. 次のステップ

1. ローカルでテストが成功したら GitHub Pages でも動作確認
2. Firebase Console の設定が正しいことを再確認
3. 本番環境での動作テスト