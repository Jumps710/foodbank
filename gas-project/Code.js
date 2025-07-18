/**
 * フードパントリー予約システム - メインエントリーポイント
 * 既存システムに影響を与えないよう、新しい機能として実装
 */

/**
 * Web Appのメインエントリーポイント（GET）
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // API リクエストの場合
    if (action) {
      return handleApiRequest(e, 'GET');
    }
    
    const page = e.parameter.page || 'form';
    
    // セキュリティ：管理画面は認証チェック
    if (page.startsWith('admin') && !isAuthenticated(e)) {
      return HtmlService.createHtmlOutput(getLoginPage());
    }
    
    switch (page) {
      case 'test':
        return testSpreadsheetAccessPage();
        
      case 'form':
        return HtmlService.createTemplateFromFile('ReservationForm').evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
        
      case 'admin-dashboard':
        return HtmlService.createTemplateFromFile('AdminDashboard').evaluate()
          .setTitle('管理ダッシュボード');
        
      case 'admin-pantries':
        return HtmlService.createTemplateFromFile('PantryManagement').evaluate()
          .setTitle('パントリー管理');
        
      case 'admin-pantry':
        return HtmlService.createTemplateFromFile('PantryManagement').evaluate()
          .setTitle('パントリー管理');
        
      case 'admin-reservations':
        return HtmlService.createTemplateFromFile('ReservationStatus').evaluate()
          .setTitle('予約状況');
        
      case 'admin-users':
        return HtmlService.createTemplateFromFile('UserManagement').evaluate()
          .setTitle('ユーザー管理');
        
      case 'admin-logs':
        return HtmlService.createTemplateFromFile('LogManagement').evaluate()
          .setTitle('ログ管理');
        
      default:
        return HtmlService.createHtmlOutput('<h1>ページが見つかりません</h1>');
    }
  } catch (error) {
    Logger.log('doGet エラー: ' + error.toString());
    return HtmlService.createHtmlOutput('<h1>エラーが発生しました</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * Web AppのAPIエントリーポイント（POST）
 */
function doPost(e) {
  return handleApiRequest(e, 'POST');
}

/**
 * API リクエストハンドラー
 */
function handleApiRequest(e, method) {
  try {
    // CORS ヘッダーを設定
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let data = {};
    let action = '';
    
    if (method === 'POST') {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
        action = data.action;
      }
    } else {
      // GET の場合はパラメータから取得
      action = e.parameter.action;
      data = e.parameter;
    }
    
    // 管理機能は認証チェック（開発中はスキップ）
    if (action && action.startsWith('admin') && !isAuthenticatedApi(data)) {
      return output.setContent(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '認証が必要です' }
      }));
    }
    
    let result;
    switch (action) {
      // 公開API
      case 'getCurrentPantry':
        result = PantryService.getCurrentActivePantry();
        break;
      case 'createReservation':
        result = ReservationService.createReservation(data);
        break;
      case 'getStatistics':
        result = getPublicStatistics(data.filters);
        break;
        
      // 予約関連
      case 'getReservations':
        result = ReservationService.getReservations(data);
        break;
      case 'cancelReservation':
        result = ReservationService.cancelReservation(data);
        break;
        
      // パントリー管理
      case 'adminCreatePantry':
        result = PantryService.createPantry(data.data);
        break;
      case 'adminGetPantries':
        result = PantryService.getPantries(data.filters || {});
        break;
      case 'adminUpdatePantry':
        result = PantryService.updatePantry(data.data);
        break;
      case 'adminDeletePantry':
        result = PantryService.deletePantry(data.pantryId);
        break;
        
      // 予約管理
      case 'adminGetReservations':
        result = ReservationService.getReservations(data.filters || {});
        break;
      case 'adminCancelReservation':
        result = ReservationService.cancelReservation({reservationId: data.reservationId});
        break;
        
      // ユーザー管理
      case 'adminGetUsers':
        result = UserService.getUsers(data.filters || {});
        break;
      case 'adminGetUserDetail':
        result = UserService.getUserDetail(data.userId);
        break;
        
      // 統計・分析
      case 'adminGetStatistics':
        result = getAdminStatistics(data.filters);
        break;
        
      // ログ管理
      case 'adminGetLogs':
        result = LogService.getLogs(data.filters || {});
        break;
      case 'adminExportLogs':
        result = LogService.exportLogs(data.filters || {});
        break;
      
      // 認証
      case 'adminLogin':
        result = handleAdminLogin(data);
        break;
        
      default:
        result = {
          success: false,
          error: { code: 'INVALID_ACTION', message: '無効なアクションです: ' + action }
        };
    }
    
    return output.setContent(JSON.stringify(result));
      
  } catch (error) {
    Logger.log('API エラー: ' + error.toString());
    LogService.logError('API', error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'システムエラーが発生しました: ' + error.message }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 認証チェック（GET）
 */
function isAuthenticated(e) {
  // 実際の実装ではFirebase Authenticationトークンをチェック
  // 開発中は簡単な認証をスキップ
  return true; // TODO: 実装
}

/**
 * 認証チェック（POST）
 */
function isAuthenticatedPost(data) {
  // 実際の実装ではFirebase Authenticationトークンをチェック
  // 開発中は簡単な認証をスキップ
  return true; // TODO: 実装
}

/**
 * API認証チェック
 */
function isAuthenticatedApi(data) {
  // 開発中は認証をスキップ
  return true; // TODO: 実装
}

/**
 * 管理者ログイン処理
 */
function handleAdminLogin(credentials) {
  // 開発中は固定の認証情報
  if (credentials.username === 'admin' && credentials.password === 'admin123') {
    return {
      success: true,
      token: 'dev-token-' + Date.now(),
      user: {
        username: 'admin',
        role: 'administrator'
      }
    };
  }
  
  return {
    success: false,
    error: { code: 'INVALID_CREDENTIALS', message: '認証情報が正しくありません' }
  };
}

/**
 * 公開統計データ取得
 */
function getPublicStatistics(filters) {
  try {
    // 簡単な統計データを返す（開発用）
    return {
      success: true,
      data: {
        totalUsers: 150,
        monthlyReservations: 45,
        activeEvents: 2,
        totalEvents: 24
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.toString() }
    };
  }
}

/**
 * 管理者統計データ取得
 */
function getAdminStatistics(filters) {
  try {
    // より詳細な統計データを返す（開発用）
    return {
      success: true,
      data: {
        totalUsers: 150,
        totalReservations: 500,
        activeEvents: 2,
        completedEvents: 22,
        monthlyStats: [
          { month: '2024-12', reservations: 45, users: 35 },
          { month: '2025-01', reservations: 52, users: 41 }
        ]
      }
    };
  } catch (error) {
    return {
      success: false,
      error: { message: error.toString() }
    };
  }
}

/**
 * ログインページ取得
 */
function getLoginPage() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ログイン - フードパントリー管理システム</title>
      <meta charset="UTF-8">
    </head>
    <body>
      <h1>ログインが必要です</h1>
      <p>管理画面にアクセスするには認証が必要です。</p>
      <!-- TODO: Firebase Authenticationのログインフォーム -->
    </body>
    </html>
  `;
}

/**
 * HTMLテンプレートにJavaScript関数を含める
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 新しいシステムの初期セットアップ
 * 注意: 既存のシステムには影響しません
 */
function setupNewSystem() {
  try {
    Logger.log('新しいシステムのセットアップを開始します...');
    
    // 新しいスプレッドシートを作成
    const spreadsheetId = initializeNewSpreadsheet();
    
    Logger.log('セットアップ完了:');
    Logger.log('- スプレッドシートID: ' + spreadsheetId);
    Logger.log('- Config.jsのNEW_SPREADSHEET_IDを更新してください');
    Logger.log('- Web AppのURLを取得してください');
    
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      message: 'セットアップが完了しました。Config.jsを更新してください。'
    };
    
  } catch (error) {
    Logger.log('セットアップエラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// HTML テンプレートから呼び出される関数

/**
 * 現在アクティブなパントリー取得
 */
function getCurrentActivePantry() {
  try {
    const pantry = PantryService.getCurrentActivePantry();
    return {
      success: true,
      data: pantry
    };
  } catch (error) {
    Logger.log('getCurrentActivePantry エラー: ' + error.toString());
    return {
      success: false,
      error: { message: error.toString() }
    };
  }
}

/**
 * 予約作成
 */
function createReservation(formData) {
  return ReservationService.createReservation(formData);
}

/**
 * パントリー作成
 */
function createPantry(data) {
  return PantryService.createPantry(data);
}

/**
 * パントリー更新
 */
function updatePantry(data) {
  return PantryService.updatePantry(data);
}

/**
 * パントリー削除
 */
function deletePantry(pantryId) {
  return PantryService.deletePantry(pantryId);
}

/**
 * パントリー一覧取得
 */
function getPantries(filters) {
  return PantryService.getPantries(filters || {});
}

/**
 * ユーザー統計取得
 */
function getUserStatistics() {
  return UserService.getUserStatistics();
}

/**
 * ログ統計取得
 */
function getLogStatistics() {
  return LogService.getLogStatistics();
}

/**
 * ログ一覧取得
 */
function getLogs(filters) {
  return LogService.getLogs(filters || {});
}

/**
 * テストページの生成
 */
function testSpreadsheetAccessPage() {
  const testResult = testSpreadsheetAccess();
  
  return HtmlService.createHtmlOutput(`
    <html>
      <head>
        <title>スプレッドシートアクセステスト</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .success { color: green; background: #f0fff0; padding: 10px; border-radius: 5px; }
          .error { color: red; background: #fff0f0; padding: 10px; border-radius: 5px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
          .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        </style>
      </head>
      <body>
        <h1>🔧 スプレッドシートアクセステスト</h1>
        
        <div class="${testResult.success ? 'success' : 'error'}">
          <h2>📊 基本アクセステスト: ${testResult.success ? '✅ 成功' : '❌ 失敗'}</h2>
          <pre>${JSON.stringify(testResult, null, 2)}</pre>
        </div>
        
        <hr>
        
        <h2>🧪 追加テスト</h2>
        <button class="button" onclick="testDashboard()">ダッシュボードデータ取得テスト</button>
        <button class="button" onclick="testConfig()">設定確認テスト</button>
        <button class="button" onclick="window.location.href='?page=admin-dashboard'">管理ダッシュボードに移動</button>
        
        <div id="testResults"></div>
        
        <hr>
        
        <h2>📋 デバッグ情報</h2>
        <ul>
          <li>スプレッドシートID: 1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU</li>
          <li>テスト実行日時: ${new Date().toLocaleString('ja-JP')}</li>
          <li>GASランタイム: V8</li>
        </ul>
        
        <script>
          function testDashboard() {
            const resultDiv = document.getElementById('testResults');
            resultDiv.innerHTML = '<p>🔄 ダッシュボードデータ取得中...</p>';
            
            google.script.run
              .withSuccessHandler(function(result) {
                resultDiv.innerHTML = 
                  '<div class="' + (result.success ? 'success' : 'error') + '">' +
                  '<h3>📊 ダッシュボードデータ取得結果</h3>' +
                  '<pre>' + JSON.stringify(result, null, 2) + '</pre>' +
                  '</div>';
              })
              .withFailureHandler(function(error) {
                resultDiv.innerHTML = 
                  '<div class="error">' +
                  '<h3>❌ ダッシュボードデータ取得エラー</h3>' +
                  '<p>' + error + '</p>' +
                  '</div>';
              })
              .testGetDashboardData();
          }
          
          function testConfig() {
            const resultDiv = document.getElementById('testResults');
            resultDiv.innerHTML = '<p>🔄 設定確認中...</p>';
            
            google.script.run
              .withSuccessHandler(function(result) {
                resultDiv.innerHTML = 
                  '<div class="success">' +
                  '<h3>⚙️ 設定確認結果</h3>' +
                  '<pre>' + JSON.stringify(result, null, 2) + '</pre>' +
                  '</div>';
              })
              .withFailureHandler(function(error) {
                resultDiv.innerHTML = 
                  '<div class="error">' +
                  '<h3>❌ 設定確認エラー</h3>' +
                  '<p>' + error + '</p>' +
                  '</div>';
              })
              .testConfiguration();
          }
        </script>
      </body>
    </html>
  `);
}

/**
 * 設定確認テスト
 */
function testConfiguration() {
  try {
    return {
      success: true,
      config: {
        NEW_SPREADSHEET_ID: CONFIG.NEW_SPREADSHEET_ID,
        EXISTING_SPREADSHEET_ID: CONFIG.EXISTING_SPREADSHEET_ID,
        SHEETS: CONFIG.SHEETS,
        LOCATIONS: CONFIG.LOCATIONS
      },
      message: '設定確認成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}