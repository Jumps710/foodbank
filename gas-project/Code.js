/**
 * フードパントリー予約システム - API専用
 * HTMLページ機能は削除し、JSON APIのみ提供
 */

/**
 * Web App API エントリーポイント（GET）
 */
function doGet(e) {
  return handleApiRequest(e, 'GET');
}

/**
 * Web App API エントリーポイント（POST）
 */
function doPost(e) {
  return handleApiRequest(e, 'POST');
}

/**
 * Web App API エントリーポイント（OPTIONS - CORS）
 */
function doOptions(e) {
  return createCorsResponse('{}');
}

/**
 * API リクエストハンドラー
 */
function handleApiRequest(e, method) {
  try {
    Logger.log('=== API Request ===');
    Logger.log('Method: ' + method);
    Logger.log('Parameters: ' + JSON.stringify(e.parameter || {}));
    
    let data = {};
    let action = '';
    
    if (method === 'POST') {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
        action = data.action;
      }
    } else {
      // GET の場合
      action = e.parameter ? e.parameter.action : null;
      data = e.parameter || {};
    }
    
    Logger.log('Action: ' + action);
    
    let result;
    switch (action) {
      case 'test':
        result = {
          success: true,
          message: 'GAS API is working!',
          timestamp: new Date().toISOString(),
          method: method,
          receivedParameters: data
        };
        break;
        
      case 'getStatistics':
        result = getPublicStatistics();
        break;
        
      case 'adminGetPantries':
        result = getTestPantries();
        break;
        
      case 'adminGetReservations':
        result = getTestReservations();
        break;
        
      case 'adminGetUsers':
        result = getTestUsers();
        break;
        
      case 'adminGetLogs':
        result = getTestLogs();
        break;
        
      default:
        result = {
          success: false,
          error: { 
            code: 'INVALID_ACTION', 
            message: '無効なアクションです: ' + (action || 'null'),
            availableActions: ['test', 'getStatistics', 'adminGetPantries', 'adminGetReservations', 'adminGetUsers', 'adminGetLogs']
          }
        };
    }
    
    Logger.log('Result: ' + JSON.stringify(result));
    return createCorsResponse(JSON.stringify(result));
    
  } catch (error) {
    Logger.log('API エラー: ' + error.toString());
    
    const errorResult = {
      success: false,
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'システムエラー: ' + error.message,
        stack: error.stack
      }
    };
    
    return createCorsResponse(JSON.stringify(errorResult));
  }
}

/**
 * CORS対応レスポンス作成
 */
function createCorsResponse(content) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * 公開統計データ取得
 */
function getPublicStatistics() {
  try {
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
 * テスト用パントリーデータ
 */
function getTestPantries() {
  return {
    success: true,
    data: [
      {
        pantry_id: '25.01.12.本庁舎',
        event_date: '2025-01-12',
        event_time: '10:00-12:00',
        location: '市川市役所本庁舎',
        capacity_total: 50,
        reservation_count: 32,
        status: 'active'
      },
      {
        pantry_id: '25.01.19.ニコット',
        event_date: '2025-01-19',
        event_time: '14:00-16:00',
        location: 'ニコット',
        capacity_total: 30,
        reservation_count: 18,
        status: 'upcoming'
      }
    ]
  };
}

/**
 * テスト用予約データ
 */
function getTestReservations() {
  return {
    success: true,
    data: [
      {
        reservation_id: 'R20250121001',
        name_kana: 'タナカ タロウ',
        pantry_id: '25.01.12.本庁舎',
        created_at: '2025-01-10T09:30:00Z',
        status: 'confirmed'
      },
      {
        reservation_id: 'R20250121002',
        name_kana: 'サトウ ハナコ',
        pantry_id: '25.01.12.本庁舎',
        created_at: '2025-01-10T14:20:00Z',
        status: 'confirmed'
      }
    ]
  };
}

/**
 * テスト用ユーザーデータ
 */
function getTestUsers() {
  return {
    success: true,
    data: [
      {
        user_id: 'U001',
        name_kana: 'タナカ タロウ',
        area: '市川市八幡',
        household_adults: 2,
        household_children: 1,
        total_visits: 5,
        last_visit_date: '2025-01-10'
      },
      {
        user_id: 'U002',
        name_kana: 'サトウ ハナコ',
        area: '市川市本八幡',
        household_adults: 1,
        household_children: 2,
        total_visits: 3,
        last_visit_date: '2025-01-08'
      }
    ]
  };
}

/**
 * テスト用ログデータ
 */
function getTestLogs() {
  return {
    success: true,
    data: [
      {
        created_at: '2025-01-10T09:30:00Z',
        event_type: 'reservation_created',
        user_name_kana: 'タナカ タロウ',
        event_detail: '予約作成: 25.01.12.本庁舎'
      },
      {
        created_at: '2025-01-10T14:20:00Z',
        event_type: 'reservation_created',
        user_name_kana: 'サトウ ハナコ',
        event_detail: '予約作成: 25.01.12.本庁舎'
      }
    ]
  };
}