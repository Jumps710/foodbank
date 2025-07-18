/**
 * 新しいスプレッドシートを作成するためのセットアップスクリプト
 * 既存のGASプロジェクトに影響を与えないよう、独立したスクリプトとして作成
 */

// 一時的に新しいスプレッドシートを作成し、IDを取得するためのスクリプト
function createNewSpreadsheet() {
  try {
    // 新しいスプレッドシートを作成
    const newSpreadsheet = SpreadsheetApp.create('フードパントリー管理システム_v2');
    const spreadsheetId = newSpreadsheet.getId();
    
    console.log('新しいスプレッドシートが作成されました: ' + spreadsheetId);
    console.log('スプレッドシートURL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    
    // 既存のデフォルトシートを削除
    const sheets = newSpreadsheet.getSheets();
    if (sheets.length > 0) {
      newSpreadsheet.deleteSheet(sheets[0]);
    }
    
    // 新しいシートを作成
    const sheetNames = [
      'Pantries_v2',
      'Users_v2', 
      'Reservations_v2',
      'UsageHistory_v2',
      'EventLogs_v2',
      'Admins_v2',
      'Settings_v2'
    ];
    
    sheetNames.forEach(name => {
      const sheet = newSpreadsheet.insertSheet(name);
      initializeSheetHeaders(sheet, name);
    });
    
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      url: 'https://docs.google.com/spreadsheets/d/' + spreadsheetId
    };
    
  } catch (error) {
    console.error('スプレッドシート作成エラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

function initializeSheetHeaders(sheet, sheetName) {
  switch (sheetName) {
    case 'Pantries_v2':
      sheet.getRange(1, 1, 1, 15).setValues([[
        'pantry_id', 'event_date', 'event_time', 'registration_start', 'registration_end',
        'location', 'location_address', 'location_access', 'capacity_total', 'capacity_used',
        'title', 'header_message', 'auto_reply_message', 'status', 'created_at'
      ]]);
      break;
      
    case 'Users_v2':
      sheet.getRange(1, 1, 1, 14).setValues([[
        'user_id', 'name_kana', 'name_kanji', 'area', 'email', 'phone',
        'household_adults', 'household_children', 'household_details',
        'first_visit_date', 'total_visits', 'last_visit_date', 'created_at', 'updated_at'
      ]]);
      break;
      
    case 'Reservations_v2':
      sheet.getRange(1, 1, 1, 15).setValues([[
        'reservation_id', 'pantry_id', 'user_id', 'name_kana', 'event_date',
        'pickup_location', 'requested_items', 'special_needs', 'allergies',
        'cooking_equipment', 'support_info', 'visit_count', 'notes', 'status', 'created_at'
      ]]);
      break;
      
    case 'UsageHistory_v2':
      sheet.getRange(1, 1, 1, 8).setValues([[
        'history_id', 'user_id', 'name_kana', 'pantry_id', 'event_date',
        'pickup_location', 'visit_count', 'created_at'
      ]]);
      break;
      
    case 'EventLogs_v2':
      sheet.getRange(1, 1, 1, 9).setValues([[
        'log_id', 'event_type', 'admin_user', 'pantry_id', 'user_name_kana',
        'reservation_id', 'event_detail', 'ip_address', 'created_at'
      ]]);
      break;
      
    case 'Admins_v2':
      sheet.getRange(1, 1, 1, 8).setValues([[
        'admin_id', 'email', 'username', 'role', 'is_active',
        'created_at', 'updated_at', 'last_login'
      ]]);
      break;
      
    case 'Settings_v2':
      sheet.getRange(1, 1, 1, 4).setValues([[
        'setting_key', 'setting_value', 'description', 'updated_at'
      ]]);
      
      // 初期設定データを挿入
      const initialSettings = [
        ['auto_registration_enabled', 'true', '自動受付開始/終了の有効化', new Date()],
        ['email_notifications_enabled', 'true', 'メール通知の有効化', new Date()],
        ['max_reservations_per_user', '1', '1ユーザーあたりの最大予約数', new Date()],
        ['reservation_id_format', 'YYMMDDNNN', '予約ID形式', new Date()],
        ['pantry_id_format', 'YY.MM.DD.場所', 'パントリーID形式', new Date()],
        ['location_city_hall', '市川市八幡1丁目1番1号', '市役所本庁舎の住所', new Date()],
        ['location_nicotto', '市川市大和田3丁目23-10', 'ニコットの住所', new Date()],
        ['access_city_hall', 'JR総武線本八幡駅より徒歩5分', '市役所本庁舎のアクセス', new Date()],
        ['access_nicotto', 'JR総武線市川駅よりバス10分', 'ニコットのアクセス', new Date()]
      ];
      
      sheet.getRange(2, 1, initialSettings.length, 4).setValues(initialSettings);
      break;
  }
  
  // ヘッダー行のフォーマット
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#f8f9fa');
  headerRange.setFontWeight('bold');
  headerRange.setWrap(false);
  
  // 列幅の自動調整
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

// 実行用の関数
function runSetup() {
  const result = createNewSpreadsheet();
  if (result.success) {
    console.log('セットアップ完了！');
    console.log('新しいスプレッドシートID: ' + result.spreadsheetId);
    console.log('このIDをConfig.jsのNEW_SPREADSHEET_IDに設定してください。');
  } else {
    console.error('セットアップ失敗: ' + result.error);
  }
}