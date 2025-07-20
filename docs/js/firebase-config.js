/**
 * Firebase設定
 * Firebase Console から取得した設定をここに貼り付けてください
 */

// Firebase Console から取得した実際の設定値
const firebaseConfig = {
  apiKey: "AIzaSyA9bIqouIAlX3TV7YrTn-6SR5eqnQSp_mQ",
  authDomain: "foodbank-management.firebaseapp.com",
  projectId: "foodbank-management",
  storageBucket: "foodbank-management.firebasestorage.app",
  messagingSenderId: "65683417930",
  appId: "1:65683417930:web:f052adacf01fe85236efb3",
  measurementId: "G-Q541RGVB48"
};

// Firebase初期化
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

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
   * メールとパスワードでアカウント作成
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: user,
        token: idToken
      };
    } catch (error) {
      console.error('Firebase アカウント作成エラー:', error);
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
      'auth/network-request-failed': 'ネットワークエラーが発生しました',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/weak-password': 'パスワードが弱すぎます。6文字以上にしてください',
      'auth/operation-not-allowed': 'この操作は許可されていません'
    };
    
    return errorMessages[errorCode] || 'エラーが発生しました';
  }
}

// グローバルインスタンス
window.firebaseAuthManager = new FirebaseAuthManager();