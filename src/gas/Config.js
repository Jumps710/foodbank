/**
 * システム設定とマスターデータ
 * 既存データに影響を与えないよう、新しいシート構造を定義
 */

/**
 * スプレッドシート設定
 * 注意: 既存のシートIDは変更せず、新しいシートを追加で使用
 */
const CONFIG = {
  // 既存のスプレッドシートID（読み取り専用として使用）
  EXISTING_SPREADSHEET_ID: '1zbbxjtNU2DOl-xXlOnkHyI2uRmzKaMGLlwgD8rUrdJQ',
  
  // 新しいシステム用のスプレッドシートID（新規作成または別途指定）
  NEW_SPREADSHEET_ID: null, // 実装時に設定
  
  // シート名（新しいシステム用）
  SHEETS: {
    PANTRIES: 'Pantries_v2',           // パントリー管理
    USERS: 'Users_v2',                 // ユーザー管理
    RESERVATIONS: 'Reservations_v2',   // 予約管理
    USAGE_HISTORY: 'UsageHistory_v2',  // 利用履歴
    EVENT_LOGS: 'EventLogs_v2',        // システムログ
    ADMINS: 'Admins_v2',               // 管理者
    SETTINGS: 'Settings_v2'            // システム設定
  },
  
  // 既存シート名（読み取り専用）
  LEGACY_SHEETS: {
    RESERVATIONS: 'reservation'         // 既存の予約データ
  },
  
  // 場所マスターデータ
  LOCATIONS: {
    '市役所本庁舎': {
      address: '市川市八幡1丁目1番1号',
      access: 'JR総武線本八幡駅より徒歩5分'
    },
    'ニコット': {
      address: '市川市大和田3丁目23-10',
      access: 'JR総武線市川駅よりバス10分'
    }
  },
  
  // システム設定
  SYSTEM: {
    MAX_RESERVATIONS_PER_USER: 1,
    DEFAULT_CAPACITY: 100,
    RESERVATION_ID_PREFIX: '',
    LOG_RETENTION_DAYS: 90,
    EMAIL_ENABLED: true
  },
  
  // 予約ID生成設定
  RESERVATION_ID: {
    FORMAT: 'YYMMDDNNN',
    MAX_PER_DAY: 999
  },
  
  // ログレベル
  LOG_LEVELS: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  
  // イベントタイプ
  EVENT_TYPES: {
    RESERVATION_CREATED: 'reservation_created',
    RESERVATION_CANCELLED: 'reservation_cancelled',
    USER_CREATED: 'user_created',
    PANTRY_CREATED: 'pantry_created',
    PANTRY_UPDATED: 'pantry_updated',
    PANTRY_DELETED: 'pantry_deleted',
    ADMIN_ACCESS: 'admin_access',
    SYSTEM_ERROR: 'system_error'
  }
};

/**
 * スプレッドシート取得（既存）
 */
function getExistingSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.EXISTING_SPREADSHEET_ID);
}

/**
 * スプレッドシート取得（新システム）
 */
function getNewSpreadsheet() {
  if (!CONFIG.NEW_SPREADSHEET_ID) {
    throw new Error('新しいスプレッドシートIDが設定されていません');
  }
  return SpreadsheetApp.openById(CONFIG.NEW_SPREADSHEET_ID);
}

/**
 * 新しいシステム用スプレッドシート初期化
 */
function initializeNewSpreadsheet() {
  try {
    // 新しいスプレッドシートを作成
    const newSpreadsheet = SpreadsheetApp.create('フードパントリー管理システム_v2');
    const spreadsheetId = newSpreadsheet.getId();
    
    Logger.log('新しいスプレッドシートが作成されました: ' + spreadsheetId);
    Logger.log('CONFIG.NEW_SPREADSHEET_ID に以下のIDを設定してください: ' + spreadsheetId);
    
    // 各シートを作成
    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      const sheet = newSpreadsheet.insertSheet(sheetName);
      initializeSheet(sheet, sheetName);
    });
    
    // デフォルトシートを削除
    const defaultSheet = newSpreadsheet.getSheetByName('シート1');
    if (defaultSheet) {
      newSpreadsheet.deleteSheet(defaultSheet);
    }
    
    return spreadsheetId;
    
  } catch (error) {
    Logger.log('スプレッドシート初期化エラー: ' + error.toString());
    throw error;
  }
}

/**
 * シート初期化
 */
function initializeSheet(sheet, sheetName) {
  switch (sheetName) {
    case CONFIG.SHEETS.PANTRIES:
      sheet.getRange(1, 1, 1, 12).setValues([[
        'pantry_id', 'event_date', 'event_time', 'registration_start', 'registration_end',
        'location', 'location_address', 'location_access', 'capacity_total',
        'title', 'header_message', 'auto_reply_message', 'status', 'created_at', 'updated_at'
      ]]);
      break;
      
    case CONFIG.SHEETS.USERS:
      sheet.getRange(1, 1, 1, 10).setValues([[
        'user_id', 'name_kana', 'name_kanji', 'area', 'email', 'phone',
        'household_adults', 'household_children', 'household_details',
        'first_visit_date', 'total_visits', 'last_visit_date', 'created_at', 'updated_at'
      ]]);
      break;
      
    case CONFIG.SHEETS.RESERVATIONS:
      sheet.getRange(1, 1, 1, 12).setValues([[
        'reservation_id', 'pantry_id', 'user_id', 'name_kana', 'event_date',
        'pickup_location', 'requested_items', 'special_needs', 'allergies',
        'cooking_equipment', 'support_info', 'visit_count', 'notes', 'status', 'created_at'
      ]]);
      break;
      
    case CONFIG.SHEETS.EVENT_LOGS:
      sheet.getRange(1, 1, 1, 8).setValues([[
        'log_id', 'event_type', 'admin_user', 'pantry_id', 'user_name_kana',
        'reservation_id', 'event_detail', 'ip_address', 'created_at'
      ]]);
      break;
      
    case CONFIG.SHEETS.ADMINS:
      sheet.getRange(1, 1, 1, 7).setValues([[
        'admin_id', 'email', 'username', 'role', 'is_active',
        'created_at', 'updated_at', 'last_login'
      ]]);
      break;
      
    case CONFIG.SHEETS.SETTINGS:
      sheet.getRange(1, 1, 1, 4).setValues([[
        'setting_key', 'setting_value', 'description', 'updated_at'
      ]]);
      // 初期設定データを挿入
      const initialSettings = [
        ['auto_registration_enabled', 'true', '自動受付開始/終了の有効化', new Date()],
        ['email_notifications_enabled', 'true', 'メール通知の有効化', new Date()],
        ['max_reservations_per_user', '1', '1ユーザーあたりの最大予約数', new Date()],
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
}

/**
 * 設定値取得
 */
function getSetting(key, defaultValue = null) {
  try {
    const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return data[i][1];
      }
    }
    
    return defaultValue;
  } catch (error) {
    Logger.log('設定取得エラー: ' + error.toString());
    return defaultValue;
  }
}

/**
 * 設定値更新
 */
function updateSetting(key, value, description = '') {
  try {
    const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    // 既存の設定を探す
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2, 1, 3).setValues([[value, description, new Date()]]);
        return;
      }
    }
    
    // 新しい設定を追加
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 4).setValues([[key, value, description, new Date()]]);
    
  } catch (error) {
    Logger.log('設定更新エラー: ' + error.toString());
    throw error;
  }
}