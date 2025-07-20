/**
 * フロントエンド設定
 */
const CONFIG = {
    // GAS API のベースURL（本番デプロイ済み - パブリックアクセス設定済み）
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbz2twbdzRlljcTMzF26UKI-YDSKA9ijERPuTTICjXydR0kA1jVZiBvtS23CneUKa-j3sw/exec',
    
    // APIエンドポイント
    ENDPOINTS: {
        // 公開API
        GET_CURRENT_PANTRY: '?action=getCurrentPantry',
        CREATE_RESERVATION: '?action=createReservation',
        GET_STATISTICS: '?action=getStatistics',
        
        // 管理API
        ADMIN_LOGIN: '?action=adminLogin',
        ADMIN_GET_PANTRIES: '?action=adminGetPantries',
        ADMIN_CREATE_PANTRY: '?action=adminCreatePantry',
        ADMIN_UPDATE_PANTRY: '?action=adminUpdatePantry',
        ADMIN_DELETE_PANTRY: '?action=adminDeletePantry',
        ADMIN_GET_RESERVATIONS: '?action=adminGetReservations',
        ADMIN_CANCEL_RESERVATION: '?action=adminCancelReservation',
        ADMIN_GET_USERS: '?action=adminGetUsers',
        ADMIN_GET_USER_DETAIL: '?action=adminGetUserDetail',
        ADMIN_GET_LOGS: '?action=adminGetLogs',
        ADMIN_EXPORT_LOGS: '?action=adminExportLogs'
    },
    
    // ローカルストレージキー
    STORAGE_KEYS: {
        ADMIN_TOKEN: 'admin_token',
        USER_PREFERENCES: 'user_preferences'
    },
    
    // UI設定
    UI: {
        ITEMS_PER_PAGE: 20,
        CHART_COLORS: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
        DATE_FORMAT: 'YYYY/MM/DD',
        TIME_FORMAT: 'HH:mm'
    },
    
    // バリデーション
    VALIDATION: {
        NAME_KANA_PATTERN: /^[ァ-ヶー\s]+$/,
        PHONE_PATTERN: /^[0-9\-\(\)\s]+$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

// 開発環境の場合のオーバーライド
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CONFIG.API_BASE_URL = 'http://localhost:3000/api'; // ローカル開発サーバー
}

// デバッグ情報をコンソール出力  
console.log('🔧 Config.js ロード完了 - API URL:', CONFIG.API_BASE_URL);
console.log('📅 Config バージョン: 2025.07.20-v8 (直接スクリプトタグ読み込み)');
console.log('🎯 期待するURL: AKfycbz2twbdzRlljcTMzF26UKI-YDSKA9ijERPuTTICjXydR0kA1jVZiBvtS23CneUKa-j3sw');
console.log('❌ 古いURL: AKfycbxRezzNB1KT5WAaIVWRtTX7Sr07BiihSmOGKHPmNIcmD4rwffRiCg5StemDplHEquvf');

// 緊急デバッグ: アラートで現在のURL確認
if (CONFIG.API_BASE_URL.includes('AKfycbxRezzN')) {
    alert('❌ 古いURLが読み込まれています！ キャッシュクリアが必要です。');
} else if (CONFIG.API_BASE_URL.includes('AKfycbz2twb')) {
    console.log('✅ 正しい新URLが読み込まれました！');
} else {
    alert('⚠️ 想定外のAPIのURLです: ' + CONFIG.API_BASE_URL);
}

// APIアクセス監視（無効化 - fetch()干渉回避）
// const originalFetch = window.fetch;
// window.fetch = function(...args) {
//     const url = args[0];
//     if (typeof url === 'string' && url.includes('script.google.com')) {
//         console.log('🌐 API Call:', url);
//         if (url.includes('AKfycbxRezzN')) {
//             console.error('❌ 古いURL使用検出!', url);
//         } else if (url.includes('AKfycbz2twb')) {
//             console.log('✅ 新しいURL使用確認!', url);
//         }
//     }
//     return originalFetch.apply(this, args);
// };