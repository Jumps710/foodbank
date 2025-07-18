/**
 * パントリー管理サービス
 * 開催イベントの作成・管理・重複チェック機能
 */

const PantryService = {
  
  /**
   * パントリー作成
   */
  createPantry: function(data) {
    try {
      // 入力値検証
      const validation = this.validatePantryData(data);
      if (!validation.isValid) {
        return { success: false, error: { code: 'VALIDATION_ERROR', message: validation.message } };
      }
      
      // 予約期間重複チェック
      const overlapCheck = this.checkDateOverlap(data.registration_start, data.registration_end);
      if (!overlapCheck.isValid) {
        return { success: false, error: { code: 'DATE_OVERLAP', message: overlapCheck.message } };
      }
      
      // パントリーID生成
      const pantryId = this.generatePantryId(data.event_date, data.location);
      
      // 場所詳細の自動設定
      const locationDetails = this.getLocationDetails(data.location);
      
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const now = new Date();
      
      const pantryData = [
        pantryId,
        new Date(data.event_date),
        data.event_time || '10:00-17:00',
        new Date(data.registration_start),
        new Date(data.registration_end),
        data.location,
        locationDetails.address,
        locationDetails.access,
        parseInt(data.capacity_total) || CONFIG.SYSTEM.DEFAULT_CAPACITY,
        data.title,
        data.header_message || '',
        data.auto_reply_message || '',
        'upcoming',
        now,
        now
      ];
      
      sheet.appendRow(pantryData);
      
      // ログ記録
      LogService.log(CONFIG.EVENT_TYPES.PANTRY_CREATED, {
        pantry_id: pantryId,
        event_detail: `パントリー作成: ${data.title}`
      });
      
      return {
        success: true,
        data: {
          pantryId: pantryId,
          message: 'パントリーを作成しました'
        }
      };
      
    } catch (error) {
      Logger.log('パントリー作成エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * パントリーID生成
   */
  generatePantryId: function(eventDate, location) {
    const date = new Date(eventDate);
    const yy = date.getFullYear().toString().slice(-2);
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    
    return `${yy}.${mm}.${dd}.${location}`;
  },
  
  /**
   * 場所詳細取得
   */
  getLocationDetails: function(location) {
    return CONFIG.LOCATIONS[location] || { address: '', access: '' };
  },
  
  /**
   * 入力値検証
   */
  validatePantryData: function(data) {
    if (!data.event_date) {
      return { isValid: false, message: '開催日は必須です' };
    }
    
    if (!data.location) {
      return { isValid: false, message: '開催場所は必須です' };
    }
    
    if (!CONFIG.LOCATIONS[data.location]) {
      return { isValid: false, message: '無効な開催場所です' };
    }
    
    if (!data.registration_start || !data.registration_end) {
      return { isValid: false, message: '予約開始日時・終了日時は必須です' };
    }
    
    if (new Date(data.registration_start) >= new Date(data.registration_end)) {
      return { isValid: false, message: '予約開始日時は終了日時より前に設定してください' };
    }
    
    if (!data.title) {
      return { isValid: false, message: 'タイトルは必須です' };
    }
    
    return { isValid: true };
  },
  
  /**
   * 予約期間重複チェック
   */
  checkDateOverlap: function(startDate, endDate) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const data = sheet.getDataRange().getValues();
      
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      
      for (let i = 1; i < data.length; i++) {
        const existingStart = new Date(data[i][3]); // registration_start
        const existingEnd = new Date(data[i][4]);   // registration_end
        const status = data[i][12];                 // status
        
        // 完了済みのパントリーは除外
        if (status === 'completed') continue;
        
        // 重複チェック
        if ((newStart <= existingEnd) && (newEnd >= existingStart)) {
          return {
            isValid: false,
            message: `予約期間が既存のパントリー（${data[i][0]}）と重複しています`
          };
        }
      }
      
      return { isValid: true };
      
    } catch (error) {
      Logger.log('重複チェックエラー: ' + error.toString());
      return { isValid: false, message: '重複チェック中にエラーが発生しました' };
    }
  },
  
  /**
   * パントリー一覧取得
   */
  getPantries: function(filters = {}) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const data = sheet.getDataRange().getValues();
      const pantries = [];
      
      for (let i = 1; i < data.length; i++) {
        const pantry = {
          pantry_id: data[i][0],
          event_date: data[i][1],
          event_time: data[i][2],
          registration_start: data[i][3],
          registration_end: data[i][4],
          location: data[i][5],
          location_address: data[i][6],
          location_access: data[i][7],
          capacity_total: data[i][8],
          title: data[i][9],
          header_message: data[i][10],
          auto_reply_message: data[i][11],
          status: data[i][12],
          created_at: data[i][13],
          updated_at: data[i][14]
        };
        
        // ステータス自動更新
        pantry.status = this.calculateStatus(pantry);
        
        // 予約数取得
        pantry.reservation_count = ReservationService.getReservationCount(pantry.pantry_id);
        
        // フィルター適用
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          if (!pantry.pantry_id.toLowerCase().includes(searchTerm) &&
              !pantry.location.toLowerCase().includes(searchTerm)) {
            continue;
          }
        }
        
        pantries.push(pantry);
      }
      
      // 開催日降順でソート
      pantries.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      
      return { success: true, data: pantries };
      
    } catch (error) {
      Logger.log('パントリー一覧取得エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * ステータス計算
   */
  calculateStatus: function(pantry) {
    const now = new Date();
    const startDate = new Date(pantry.registration_start);
    const endDate = new Date(pantry.registration_end);
    const eventDate = new Date(pantry.event_date);
    
    if (eventDate < now) {
      return 'completed';
    } else if (now >= startDate && now <= endDate) {
      return 'open';
    } else if (now < startDate) {
      return 'upcoming';
    } else {
      return 'closed';
    }
  },
  
  /**
   * パントリー更新
   */
  updatePantry: function(data) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const allData = sheet.getDataRange().getValues();
      
      for (let i = 1; i < allData.length; i++) {
        if (allData[i][0] === data.pantry_id) {
          // 更新可能な項目のみ更新
          const updates = [];
          updates[1] = data.event_date ? new Date(data.event_date) : allData[i][1];
          updates[2] = data.event_time || allData[i][2];
          updates[3] = data.registration_start ? new Date(data.registration_start) : allData[i][3];
          updates[4] = data.registration_end ? new Date(data.registration_end) : allData[i][4];
          updates[5] = data.location || allData[i][5];
          updates[8] = data.capacity_total ? parseInt(data.capacity_total) : allData[i][8];
          updates[9] = data.title || allData[i][9];
          updates[10] = data.header_message !== undefined ? data.header_message : allData[i][10];
          updates[11] = data.auto_reply_message !== undefined ? data.auto_reply_message : allData[i][11];
          updates[14] = new Date(); // updated_at
          
          // 場所が変更された場合、住所・アクセスも更新
          if (data.location && data.location !== allData[i][5]) {
            const locationDetails = this.getLocationDetails(data.location);
            updates[6] = locationDetails.address;
            updates[7] = locationDetails.access;
          }
          
          // 変更された項目のみ更新
          for (let col = 1; col < updates.length; col++) {
            if (updates[col] !== undefined) {
              sheet.getRange(i + 1, col + 1).setValue(updates[col]);
            }
          }
          
          // ログ記録
          LogService.log(CONFIG.EVENT_TYPES.PANTRY_UPDATED, {
            pantry_id: data.pantry_id,
            event_detail: 'パントリー情報更新'
          });
          
          return { success: true, message: 'パントリー情報を更新しました' };
        }
      }
      
      return { success: false, error: { code: 'PANTRY_NOT_FOUND', message: 'パントリーが見つかりません' } };
      
    } catch (error) {
      Logger.log('パントリー更新エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * パントリー削除
   */
  deletePantry: function(pantryId) {
    try {
      // 予約が存在する場合は削除不可
      const reservationCount = ReservationService.getReservationCount(pantryId);
      if (reservationCount > 0) {
        return {
          success: false,
          error: { code: 'CANNOT_DELETE', message: '予約が存在するため削除できません' }
        };
      }
      
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === pantryId) {
          sheet.deleteRow(i + 1);
          
          // ログ記録
          LogService.log(CONFIG.EVENT_TYPES.PANTRY_DELETED, {
            pantry_id: pantryId,
            event_detail: 'パントリー削除'
          });
          
          return { success: true, message: 'パントリーを削除しました' };
        }
      }
      
      return { success: false, error: { code: 'PANTRY_NOT_FOUND', message: 'パントリーが見つかりません' } };
      
    } catch (error) {
      Logger.log('パントリー削除エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * 現在予約受付中のパントリー取得
   */
  getCurrentActivePantry: function() {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.PANTRIES);
      const data = sheet.getDataRange().getValues();
      const now = new Date();
      
      for (let i = 1; i < data.length; i++) {
        const startDate = new Date(data[i][3]);
        const endDate = new Date(data[i][4]);
        
        if (now >= startDate && now <= endDate) {
          return {
            pantry_id: data[i][0],
            event_date: data[i][1],
            event_time: data[i][2],
            location: data[i][5],
            location_address: data[i][6],
            location_access: data[i][7],
            capacity_total: data[i][8],
            title: data[i][9],
            header_message: data[i][10],
            auto_reply_message: data[i][11]
          };
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('アクティブパントリー取得エラー: ' + error.toString());
      return null;
    }
  }
};