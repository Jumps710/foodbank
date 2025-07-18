/**
 * スプレッドシートの初期化スクリプト
 * 新しいスプレッドシート (1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU) を初期化
 */

function initializeNewSpreadsheet() {
  const spreadsheetId = '1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('スプレッドシートにアクセス成功: ' + spreadsheet.getName());
    
    // 既存のシートを取得（通常はSheet1）
    const existingSheets = spreadsheet.getSheets();
    
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
      let sheet = spreadsheet.getSheetByName(name);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(name);
        console.log('シート作成: ' + name);
      }
      initializeSheet(sheet, name);
    });
    
    // 既存のデフォルトシートを削除
    existingSheets.forEach(sheet => {
      if (!sheetNames.includes(sheet.getName())) {
        console.log('不要なシートを削除: ' + sheet.getName());
        spreadsheet.deleteSheet(sheet);
      }
    });
    
    console.log('スプレッドシートの初期化が完了しました');
    return {
      success: true,
      message: 'スプレッドシートが正常に初期化されました',
      spreadsheetId: spreadsheetId,
      url: 'https://docs.google.com/spreadsheets/d/' + spreadsheetId
    };
    
  } catch (error) {
    console.error('初期化エラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

function initializeSheet(sheet, sheetName) {
  // シートをクリア
  sheet.clear();
  
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
        ['access_nicotto', 'JR総武線市川駅よりバス10分', 'ニコットのアクセス', new Date()],
        ['system_version', '2.0.0', 'システムバージョン', new Date()],
        ['last_initialized', new Date().toISOString(), '最終初期化日時', new Date()]
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
  
  // データ検証やフォーマットの設定
  if (sheetName === 'Pantries_v2') {
    // 日付列の書式設定
    sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd'); // event_date
    sheet.getRange('D:E').setNumberFormat('yyyy-mm-dd hh:mm'); // registration dates
    sheet.getRange('O:O').setNumberFormat('yyyy-mm-dd hh:mm:ss'); // created_at
  }
  
  if (sheetName === 'Users_v2') {
    // 日付列の書式設定
    sheet.getRange('J:L').setNumberFormat('yyyy-mm-dd'); // visit dates
    sheet.getRange('M:N').setNumberFormat('yyyy-mm-dd hh:mm:ss'); // created/updated
  }
  
  if (sheetName === 'Reservations_v2') {
    // 日付列の書式設定
    sheet.getRange('E:E').setNumberFormat('yyyy-mm-dd'); // event_date
    sheet.getRange('O:O').setNumberFormat('yyyy-mm-dd hh:mm:ss'); // created_at
  }
  
  console.log('シート初期化完了: ' + sheetName);
}

// テスト用サンプルデータ挿入
function insertSampleData() {
  const spreadsheetId = '1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // サンプルパントリーデータ
    const pantriesSheet = spreadsheet.getSheetByName('Pantries_v2');
    const samplePantries = [
      [
        '25.01.18.ニコット', // pantry_id
        '2025-01-18', // event_date
        '10:00-17:00', // event_time
        '2025-01-08 09:00', // registration_start
        '2025-01-17 22:00', // registration_end
        'ニコット', // location
        '市川市大和田3丁目23-10', // location_address
        'JR総武線市川駅よりバス10分', // location_access
        100, // capacity_total
        0, // capacity_used
        '1月フードパントリー', // title
        '新年最初のフードパントリーです。皆様のご利用をお待ちしております。', // header_message
        'ご予約ありがとうございます。当日は時間に余裕をもってお越しください。', // auto_reply_message
        'upcoming', // status
        new Date() // created_at
      ]
    ];
    
    pantriesSheet.getRange(2, 1, samplePantries.length, 15).setValues(samplePantries);
    
    // サンプルユーザーデータ
    const usersSheet = spreadsheet.getSheetByName('Users_v2');
    const sampleUsers = [
      [
        'USR001', // user_id
        'ヤマダタロウ', // name_kana
        '山田太郎', // name_kanji
        '八幡', // area
        'yamada@example.com', // email
        '080-1234-5678', // phone
        '2', // household_adults
        '1', // household_children
        '大人2名、子供1名（5歳）', // household_details
        '2024-01-15', // first_visit_date
        5, // total_visits
        '2024-12-15', // last_visit_date
        new Date(), // created_at
        new Date() // updated_at
      ]
    ];
    
    usersSheet.getRange(2, 1, sampleUsers.length, 14).setValues(sampleUsers);
    
    // ログデータ
    const logsSheet = spreadsheet.getSheetByName('EventLogs_v2');
    const sampleLogs = [
      [
        'LOG001', // log_id
        'system_initialized', // event_type
        'admin', // admin_user
        '', // pantry_id
        '', // user_name_kana
        '', // reservation_id
        'システムが初期化されました', // event_detail
        '127.0.0.1', // ip_address
        new Date() // created_at
      ]
    ];
    
    logsSheet.getRange(2, 1, sampleLogs.length, 9).setValues(sampleLogs);
    
    console.log('サンプルデータの挿入が完了しました');
    return {
      success: true,
      message: 'サンプルデータが正常に挿入されました'
    };
    
  } catch (error) {
    console.error('サンプルデータ挿入エラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// メイン実行関数
function runInitialization() {
  console.log('=== スプレッドシート初期化開始 ===');
  
  const initResult = initializeNewSpreadsheet();
  if (initResult.success) {
    console.log('初期化成功: ' + initResult.message);
    
    const sampleResult = insertSampleData();
    if (sampleResult.success) {
      console.log('サンプルデータ挿入成功: ' + sampleResult.message);
    } else {
      console.error('サンプルデータ挿入失敗: ' + sampleResult.error);
    }
    
    console.log('=== 初期化完了 ===');
    console.log('スプレッドシートURL: ' + initResult.url);
    
  } else {
    console.error('初期化失敗: ' + initResult.error);
  }
}