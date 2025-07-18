/**
 * フードパントリー予約システム - メインエントリーポイント
 * 既存システムに影響を与えないよう、新しい機能として実装
 */

/**
 * Web Appのメインエントリーポイント（GET）
 */
function doGet(e) {
  try {
    const page = e.parameter.page || 'form';
    
    // セキュリティ：管理画面は認証チェック
    if (page.startsWith('admin') && !isAuthenticated(e)) {
      return HtmlService.createHtmlOutput(getLoginPage());
    }
    
    switch (page) {
      case 'form':
        return HtmlService.createTemplateFromFile('ReservationForm').evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
        
      case 'admin-dashboard':
        return HtmlService.createTemplateFromFile('AdminDashboard').evaluate()
          .setTitle('管理ダッシュボード');
        
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
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // 管理機能は認証チェック
    if (action.startsWith('admin') && !isAuthenticatedPost(data)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '認証が必要です' }
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    let result;
    switch (action) {
      // 予約関連
      case 'createReservation':
        result = ReservationService.createReservation(data);
        break;
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
        result = PantryService.getPantries(data.data);
        break;
      case 'adminUpdatePantry':
        result = PantryService.updatePantry(data.data);
        break;
        
      // ユーザー管理
      case 'adminGetUsers':
        result = UserService.getUsers(data.data);
        break;
      case 'adminGetUserDetail':
        result = UserService.getUserDetail(data.data);
        break;
        
      // 統計・分析
      case 'adminGetStatistics':
        result = AnalyticsService.getStatistics(data.data);
        break;
        
      // ログ管理
      case 'adminGetLogs':
        result = LogService.getLogs(data.data);
        break;
      case 'adminExportLogs':
        result = LogService.exportLogs(data.data);
        break;
        
      default:
        result = {
          success: false,
          error: { code: 'INVALID_ACTION', message: '無効なアクションです' }
        };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('doPost エラー: ' + error.toString());
    LogService.logError('doPost', error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'システムエラーが発生しました' }
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