/**
 * シンプルAPIクライアント（kodomonw成功パターン適用）
 */

/**
 * APIリクエスト共通関数
 */
async function apiRequest(path, method = 'GET', data = null) {
  try {
    console.log('🌐 API Request:', method, path, data);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };
    
    let url = CONFIG.API_BASE_URL;
    
    if (method === 'GET') {
      // pathにクエリパラメータが含まれている場合の処理
      if (path.includes('?')) {
        const [action, params] = path.split('?');
        url += `?action=${action}&${params}`;
      } else {
        url += `?action=${path}`;
      }
    } else {
      // POST の場合は URLSearchParams を使用
      const params = new URLSearchParams();
      params.append('action', path);
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          params.append(key, value);
        }
      }
      options.body = params;
    }
    
    console.log('🌐 Final URL:', url);
    console.log('🌐 Options:', options);
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log('✅ API Response:', result);
    
    if (!result.success && result.error) {
      throw new Error(result.error.message || result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

/**
 * 公開API
 */
const publicApi = {
  // 統計データ取得
  async getStatistics() {
    return apiRequest('getStatistics');
  },
  
  // 現在のパントリー取得
  async getCurrentPantry() {
    return apiRequest('getCurrentPantry');
  },
  
  // 予約作成
  async createReservation(data) {
    return apiRequest('createReservation', 'POST', data);
  }
};

/**
 * 管理API
 */
const adminApi = {
  // パントリー一覧取得
  async getPantries() {
    return apiRequest('adminGetPantries');
  },
  
  // 予約一覧取得  
  async getReservations() {
    return apiRequest('adminGetReservations');
  },
  
  // ユーザー一覧取得
  async getUsers() {
    return apiRequest('adminGetUsers');
  },
  
  // ログ一覧取得
  async getLogs() {
    return apiRequest('adminGetLogs');
  },
  
  // パントリー作成
  async createPantry(data) {
    return apiRequest('adminCreatePantry', 'POST', data);
  },
  
  // パントリー更新
  async updatePantry(data) {
    return apiRequest('adminUpdatePantry', 'POST', data);
  },
  
  // 予約キャンセル
  async cancelReservation(reservationId) {
    return apiRequest('adminCancelReservation', 'POST', { reservationId });
  }
};

/**
 * テスト用API呼び出し
 */
async function testApi() {
  try {
    console.log('=== API テスト開始 ===');
    
    // 1. テストエンドポイント
    console.log('1. テストAPI呼び出し...');
    const testResult = await apiRequest('test');
    console.log('✅ テスト結果:', testResult);
    
    // 2. 統計データ取得
    console.log('2. 統計データ取得...');
    const statsResult = await publicApi.getStatistics();
    console.log('✅ 統計データ:', statsResult);
    
    // 3. パントリー一覧取得
    console.log('3. パントリー一覧取得...');
    const pantriesResult = await adminApi.getPantries();
    console.log('✅ パントリー一覧:', pantriesResult);
    
    console.log('=== API テスト完了 ===');
    return {
      success: true,
      message: 'すべてのAPIテストが成功しました',
      results: {
        test: testResult,
        statistics: statsResult,
        pantries: pantriesResult
      }
    };
    
  } catch (error) {
    console.error('❌ API テスト失敗:', error);
    return {
      success: false,
      error: error.message,
      message: 'APIテストが失敗しました'
    };
  }
}

// ブラウザのコンソールからテスト実行できるようにグローバルに公開
window.testApi = testApi;
window.publicApi = publicApi;
window.adminApi = adminApi;
window.apiRequest = apiRequest;

console.log('📡 Simple API Client loaded');
console.log('💡 コンソールで testApi() を実行してテストできます');