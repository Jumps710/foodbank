/**
 * ログ管理サービス
 * システムイベントの記録・監視・エクスポート機能
 */

const LogService = {
  
  /**
   * ログ記録（一般）
   */
  log: function(eventType, data = {}) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.EVENT_LOGS);
      const now = new Date();
      const logId = this.generateLogId(now);
      
      const logData = [
        logId,
        eventType,
        data.admin_user || '',
        data.pantry_id || '',
        data.user_name_kana || '',
        data.reservation_id || '',
        data.event_detail || '',
        this.getClientIP(),
        now
      ];
      
      sheet.appendRow(logData);
      
    } catch (error) {
      Logger.log('ログ記録エラー: ' + error.toString());
      // ログ記録エラーは他の処理に影響させない
    }
  },
  
  /**
   * エラーログ記録
   */
  logError: function(context, errorMessage, additionalData = {}) {
    try {
      this.log(CONFIG.EVENT_TYPES.SYSTEM_ERROR, {
        event_detail: `${context}: ${errorMessage}`,
        ...additionalData
      });
      
      // 重要なエラーは Logger にも記録
      Logger.log(`ERROR [${context}]: ${errorMessage}`);
      
    } catch (error) {
      Logger.log('エラーログ記録エラー: ' + error.toString());
    }
  },
  
  /**
   * 管理画面アクセスログ
   */
  logAdminAccess: function(adminUser, page) {
    this.log(CONFIG.EVENT_TYPES.ADMIN_ACCESS, {
      admin_user: adminUser,
      event_detail: `管理画面アクセス: ${page}`
    });
  },
  
  /**
   * ログID生成
   */
  generateLogId: function(date) {
    const timestamp = date.getTime().toString();
    return 'L' + timestamp.slice(-12); // 'L' + 末尾12桁
  },
  
  /**
   * クライアントIP取得（簡易版）
   */
  getClientIP: function() {
    try {
      // GASではクライアントIPの取得は制限されている
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  },
  
  /**
   * ログ一覧取得
   */
  getLogs: function(filters = {}) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.EVENT_LOGS);
      const data = sheet.getDataRange().getValues();
      const logs = [];
      
      // フィルター条件の準備
      const now = new Date();
      let startDate, endDate;
      
      switch (filters.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          endDate = now;
          break;
        default:
          startDate = null;
          endDate = null;
      }
      
      for (let i = 1; i < data.length; i++) {
        const log = {
          log_id: data[i][0],
          event_type: data[i][1],
          admin_user: data[i][2],
          pantry_id: data[i][3],
          user_name_kana: data[i][4],
          reservation_id: data[i][5],
          event_detail: data[i][6],
          ip_address: data[i][7],
          created_at: data[i][8]
        };
        
        // 期間フィルター
        if (startDate && endDate) {
          const logDate = new Date(log.created_at);
          if (logDate < startDate || logDate > endDate) continue;
        }
        
        // レベルフィルター
        if (filters.level) {
          const logLevel = this.getLogLevel(log.event_type);
          if (logLevel !== filters.level) continue;
        }
        
        // イベントタイプフィルター
        if (filters.eventType && log.event_type !== filters.eventType) continue;
        
        // 検索フィルター
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          if (!log.user_name_kana.toLowerCase().includes(searchTerm) &&
              !log.event_detail.toLowerCase().includes(searchTerm) &&
              !log.ip_address.toLowerCase().includes(searchTerm)) continue;
        }
        
        logs.push(log);
      }
      
      // 作成日時降順でソート
      logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return { success: true, data: logs };
      
    } catch (error) {
      Logger.log('ログ一覧取得エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * ログレベル判定
   */
  getLogLevel: function(eventType) {
    switch (eventType) {
      case CONFIG.EVENT_TYPES.SYSTEM_ERROR:
        return 'error';
      case CONFIG.EVENT_TYPES.RESERVATION_CREATED:
      case CONFIG.EVENT_TYPES.PANTRY_CREATED:
        return 'success';
      case CONFIG.EVENT_TYPES.RESERVATION_CANCELLED:
        return 'warning';
      default:
        return 'info';
    }
  },
  
  /**
   * ログ統計取得
   */
  getLogStatistics: function(hours = 24) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.EVENT_LOGS);
      const data = sheet.getDataRange().getValues();
      
      const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
      
      let total = 0;
      let success = 0;
      let error = 0;
      let warning = 0;
      
      for (let i = 1; i < data.length; i++) {
        const logDate = new Date(data[i][8]);
        if (logDate >= cutoffTime) {
          total++;
          
          const level = this.getLogLevel(data[i][1]);
          switch (level) {
            case 'success': success++; break;
            case 'error': error++; break;
            case 'warning': warning++; break;
          }
        }
      }
      
      return {
        total: total,
        success: success,
        error: error,
        warning: warning,
        info: total - success - error - warning
      };
      
    } catch (error) {
      Logger.log('ログ統計取得エラー: ' + error.toString());
      return { total: 0, success: 0, error: 0, warning: 0, info: 0 };
    }
  },
  
  /**
   * CSVエクスポート
   */
  exportLogs: function(data) {
    try {
      const logs = this.getLogs(data.filters || {});
      if (!logs.success) {
        return logs;
      }
      
      // CSVヘッダー
      const csvData = [
        ['ログID', 'イベントタイプ', '管理者', 'パントリーID', 'ユーザー名', '予約ID', '詳細', 'IPアドレス', '日時']
      ];
      
      // データ行追加
      logs.data.forEach(log => {
        csvData.push([
          log.log_id,
          log.event_type,
          log.admin_user,
          log.pantry_id,
          log.user_name_kana,
          log.reservation_id,
          log.event_detail,
          log.ip_address,
          Utilities.formatDate(new Date(log.created_at), 'JST', 'yyyy/MM/dd HH:mm:ss')
        ]);
      });
      
      // CSV文字列生成
      const csvString = csvData.map(row => 
        row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Blobとして作成
      const blob = Utilities.newBlob(csvString, 'text/csv', `event_logs_${Utilities.formatDate(new Date(), 'JST', 'yyyyMMdd_HHmmss')}.csv`);
      
      // Google Driveに保存
      const file = DriveApp.createFile(blob);
      
      return {
        success: true,
        data: {
          fileId: file.getId(),
          fileName: file.getName(),
          downloadUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
          message: 'CSVファイルを生成しました'
        }
      };
      
    } catch (error) {
      Logger.log('CSVエクスポートエラー: ' + error.toString());
      return { success: false, error: { code: 'EXPORT_ERROR', message: 'エクスポート中にエラーが発生しました' } };
    }
  },
  
  /**
   * 古いログ削除
   */
  clearOldLogs: function(retentionDays = 90) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.EVENT_LOGS);
      const data = sheet.getDataRange().getValues();
      
      const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000));
      let deletedCount = 0;
      
      // 後ろから削除（行番号の変動を避けるため）
      for (let i = data.length - 1; i >= 1; i--) {
        const logDate = new Date(data[i][8]);
        if (logDate < cutoffDate) {
          sheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
      
      // 削除実行をログ記録
      this.log('log_cleanup', {
        event_detail: `古いログ削除: ${deletedCount}件削除 (${retentionDays}日以前)`
      });
      
      return {
        success: true,
        data: {
          deletedCount: deletedCount,
          message: `${deletedCount}件の古いログを削除しました`
        }
      };
      
    } catch (error) {
      Logger.log('古いログ削除エラー: ' + error.toString());
      return { success: false, error: { code: 'CLEANUP_ERROR', message: '削除中にエラーが発生しました' } };
    }
  }
};

/**
 * 定期実行用：古いログの自動削除
 */
function autoCleanupLogs() {
  try {
    const retentionDays = parseInt(getSetting('log_retention_days', '90'));
    LogService.clearOldLogs(retentionDays);
  } catch (error) {
    Logger.log('自動ログクリーンアップエラー: ' + error.toString());
  }
}