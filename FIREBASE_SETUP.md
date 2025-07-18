# Firebase Authentication セットアップ手順

## 1. Firebaseプロジェクト作成
1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `foodbank-management`
4. Google Analyticsは任意で設定
5. プロジェクトを作成

## 2. Authentication設定
1. 左サイドバーで「Authentication」をクリック
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
5. 「ユーザー」タブで管理者アカウントを作成
   - メール: admin@foodbank.local
   - パスワード: （任意の強力なパスワード）

## 3. Webアプリの追加
1. プロジェクト設定（歯車アイコン）をクリック
2. 「全般」タブで「アプリを追加」
3. Webアプリ（</>）を選択
4. アプリのニックネーム: `foodbank-web`
5. Firebase Hostingは設定しない（GitHub Pagesを使用）
6. 「アプリを登録」をクリック

## 4. 設定情報の取得
Firebase設定オブジェクトをコピーして、以下のファイルに貼り付け：
- `js/firebase-config.js`

設定例：
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 5. セキュリティルール（推奨）
Firestore Database > Rules で以下を設定：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. 承認済みドメインの追加
Authentication > Settings > 承認済みドメイン に以下を追加：
- `jumps710.github.io`
- `localhost` (開発用)