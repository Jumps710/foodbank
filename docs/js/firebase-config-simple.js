/**
 * Firebase設定（ES5形式）
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

// Firebase認証管理クラス
class FirebaseAuthManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.currentUser = null;
    this.initialized = false;
    this.init();
  }

  /**
   * Firebase初期化
   */
  async init() {
    try {
      // Firebase SDKをロード
      if (!window.firebase) {
        console.log('Firebase SDKをロード中...');
        await this.loadFirebaseSDK();
      }

      // Firebase アプリケーションを初期化
      this.app = firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      
      // ローカル環境での設定
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('ローカル環境を検出しました');
        // ローカル環境でのFirebase設定を調整
        this.auth.settings.appVerificationDisabledForTesting = true;
      }
      
      this.setupAuthStateListener();
      this.initialized = true;
      console.log('Firebase認証システムが初期化されました');
    } catch (error) {
      console.error('Firebase初期化エラー:', error);
    }
  }

  /**
   * Firebase SDKをロード
   */
  loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
      if (window.firebase) {
        resolve();
        return;
      }

      // Firebase App SDK
      const appScript = document.createElement('script');
      appScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      appScript.onload = () => {
        // Firebase Auth SDK
        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
        authScript.onload = resolve;
        authScript.onerror = reject;
        document.head.appendChild(authScript);
      };
      appScript.onerror = reject;
      document.head.appendChild(appScript);
    });
  }

  /**
   * 認証状態の監視
   */
  setupAuthStateListener() {
    this.auth.onAuthStateChanged((user) => {
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
      if (!this.initialized) {
        await this.waitForInitialization();
      }

      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
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
      if (!this.initialized) {
        await this.waitForInitialization();
      }

      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
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
   * Googleアカウントでサインイン
   */
  async signInWithGoogle() {
    try {
      if (!this.initialized) {
        await this.waitForInitialization();
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await this.auth.signInWithPopup(provider);
      const user = userCredential.user;
      
      // IDトークンを取得
      const idToken = await user.getIdToken();
      
      return {
        success: true,
        user: user,
        token: idToken,
        isNewUser: userCredential.additionalUserInfo?.isNewUser || false
      };
    } catch (error) {
      console.error('Google サインインエラー:', error);
      
      // ポップアップがブロックされた場合のフォールバック
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        return this.signInWithGoogleRedirect();
      }
      
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
   * Googleアカウントでサインイン（リダイレクト方式）
   */
  async signInWithGoogleRedirect() {
    try {
      if (!this.initialized) {
        await this.waitForInitialization();
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      await this.auth.signInWithRedirect(provider);
      
      // リダイレクトするため、結果は次のページ読み込み時に取得
      return {
        success: true,
        redirect: true,
        message: 'Googleサインインページにリダイレクトします...'
      };
    } catch (error) {
      console.error('Google リダイレクト サインインエラー:', error);
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
   * リダイレクト結果を処理
   */
  async getRedirectResult() {
    try {
      if (!this.initialized) {
        await this.waitForInitialization();
      }

      const result = await this.auth.getRedirectResult();
      if (result.user) {
        const idToken = await result.user.getIdToken();
        return {
          success: true,
          user: result.user,
          token: idToken,
          isNewUser: result.additionalUserInfo?.isNewUser || false
        };
      }
      
      return { success: false, noResult: true };
    } catch (error) {
      console.error('リダイレクト結果取得エラー:', error);
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
      await this.auth.signOut();
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
   * 初期化完了まで待機
   */
  waitForInitialization() {
    return new Promise((resolve) => {
      if (this.initialized) {
        resolve();
        return;
      }
      
      const check = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
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
      'auth/operation-not-allowed': 'この操作は許可されていません',
      'auth/popup-blocked': 'ポップアップがブロックされました。ポップアップを許可してください',
      'auth/popup-closed-by-user': 'サインインがキャンセルされました',
      'auth/cancelled-popup-request': 'サインインリクエストがキャンセルされました',
      'auth/account-exists-with-different-credential': '別の方法で登録されたアカウントです'
    };
    
    return errorMessages[errorCode] || 'エラーが発生しました';
  }
}

// グローバルインスタンス
window.firebaseAuthManager = new FirebaseAuthManager();