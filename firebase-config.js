/**
 * Firebase設定
 * Firebase Console から取得した設定をここに貼り付けてください
 */

// TODO: Firebase Console から実際の設定値に置き換えてください
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase初期化
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase アプリケーションを初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firebase認証管理クラス
class FirebaseAuthManager {
  constructor() {
    this.auth = auth;
    this.currentUser = null;
    this.setupAuthStateListener();
  }

  /**
   * 認証状態の監視
   */
  setupAuthStateListener() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        // ログイン済み
        this.onAuthStateChanged(user);
      } else {
        // ログアウト状態
        this.onAuthStateChanged(null);
      }
    });
  }

  /**
   * メールとパスワードでログイン
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: user,
        token: idToken
      };
    } catch (error) {
      console.error('Firebase認証エラー:', error);
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }

  /**
   * ログアウト
   */
  async signOut() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error('ログアウトエラー:', error);
      return {
        success: false,
        error: { message: error.message }
      };
    }
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 認証状態を確認
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * IDトークンを取得
   */
  async getIdToken() {
    if (this.currentUser) {
      try {
        return await this.currentUser.getIdToken();
      } catch (error) {
        console.error('トークン取得エラー:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * 認証状態変更時のコールバック（オーバーライド可能）
   */
  onAuthStateChanged(user) {
    // 子クラスでオーバーライドして使用
    console.log('認証状態変更:', user ? 'ログイン済み' : 'ログアウト');
  }

  /**
   * エラーメッセージの日本語化
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'ユーザーが見つかりません',
      'auth/wrong-password': 'パスワードが間違っています',
      'auth/invalid-email': 'メールアドレスの形式が正しくありません',
      'auth/user-disabled': 'このアカウントは無効化されています',
      'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください',
      'auth/network-request-failed': 'ネットワークエラーが発生しました'
    };
    
    return errorMessages[errorCode] || 'ログインに失敗しました';
  }
}

// グローバルインスタンス
window.firebaseAuthManager = new FirebaseAuthManager();