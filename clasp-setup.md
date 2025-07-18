# Clasp設定とデプロイ自動化

## 概要
Claspを使用してGASプロジェクトのデプロイを自動化する設定手順。

## 前提条件
- Node.js がインストールされている
- Google Apps Script API が有効になっている
- プロジェクトディレクトリが設定されている

## 手順

### 1. Claspのインストール
```bash
npm install -g @google/clasp
```

### 2. Google Apps Script API の有効化
1. https://script.google.com/home/usersettings にアクセス
2. 「Google Apps Script API」を ON にする

### 3. Claspログイン
```bash
clasp login
```

### 4. プロジェクトの初期化
```bash
cd gas-project
clasp create --title "フードパントリー管理システム_v2" --type webapp
```

### 5. .clasprc.json の設定
```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./gas-project"
}
```

### 6. .clasp.json の設定
```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./gas-project"
}
```

### 7. デプロイスクリプトの作成
package.jsonに以下を追加：

```json
{
  "scripts": {
    "deploy": "clasp push && clasp deploy",
    "push": "clasp push",
    "open": "clasp open"
  }
}
```

### 8. 自動デプロイの実行
```bash
npm run deploy
```

## 注意事項
- .clasp.json にはスクリプトIDが含まれるため、セキュリティに注意
- 本番環境では環境変数を使用することを推奨
- デプロイ前に必ずテストを実行する