/**
 * ユーザー管理サービス
 * カタカナ氏名による一意識別を実装
 */

const UserService = {
  
  /**
   * ユーザー検索（カタカナ氏名による）
   */
  findUserByNameKana: function(nameKana) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === nameKana) { // name_kana カラム
          return {
            user_id: data[i][0],
            name_kana: data[i][1],
            name_kanji: data[i][2],
            area: data[i][3],
            email: data[i][4],
            phone: data[i][5],
            household_adults: data[i][6],
            household_children: data[i][7],
            household_details: data[i][8],
            first_visit_date: data[i][9],
            total_visits: data[i][10],
            last_visit_date: data[i][11],
            created_at: data[i][12],
            updated_at: data[i][13]
          };
        }
      }
      
      return null;
    } catch (error) {
      Logger.log('ユーザー検索エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * ユーザー作成または更新
   */
  findOrCreateUser: function(formData) {
    try {
      const nameKana = formData.nameKana;
      let user = this.findUserByNameKana(nameKana);
      
      if (user) {
        // 既存ユーザーの情報を更新
        this.updateUser(nameKana, formData);
        return nameKana; // ユーザーIDとしてカタカナ氏名を返す
      } else {
        // 新規ユーザーを作成
        return this.createUser(formData);
      }
    } catch (error) {
      Logger.log('ユーザー作成/更新エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * 新規ユーザー作成
   */
  createUser: function(formData) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const nameKana = formData.nameKana;
      const now = new Date();
      
      const userData = [
        nameKana,                    // user_id（カタカナ氏名）
        nameKana,                    // name_kana
        formData.nameKanji || '',    // name_kanji
        formData.area || '',         // area
        formData.email || formData.contact || '', // email
        formData.phone || formData.contact || '', // phone
        parseInt(formData.adults) || 0,    // household_adults
        parseInt(formData.children) || 0,  // household_children
        formData.householdDetails || '',   // household_details
        null,                       // first_visit_date（初回予約時に設定）
        0,                          // total_visits
        null,                       // last_visit_date
        now,                        // created_at
        now                         // updated_at
      ];
      
      sheet.appendRow(userData);
      
      // ログ記録
      LogService.log(CONFIG.EVENT_TYPES.USER_CREATED, {
        user_name_kana: nameKana,
        event_detail: '新規ユーザー作成'
      });
      
      return nameKana;
      
    } catch (error) {
      Logger.log('ユーザー作成エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * ユーザー情報更新
   */
  updateUser: function(nameKana, formData) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === nameKana) { // name_kana カラム
          // 更新可能な項目のみ更新
          const updates = [];
          updates[2] = formData.nameKanji || data[i][2];     // name_kanji
          updates[3] = formData.area || data[i][3];          // area
          updates[4] = formData.email || formData.contact || data[i][4]; // email
          updates[5] = formData.phone || formData.contact || data[i][5]; // phone
          updates[6] = parseInt(formData.adults) || data[i][6];    // household_adults
          updates[7] = parseInt(formData.children) || data[i][7];  // household_children
          updates[8] = formData.householdDetails || data[i][8];    // household_details
          updates[13] = new Date(); // updated_at
          
          // 変更された項目のみ更新
          for (let col = 2; col < updates.length; col++) {
            if (updates[col] !== undefined) {
              sheet.getRange(i + 1, col + 1).setValue(updates[col]);
            }
          }
          
          break;
        }
      }
    } catch (error) {
      Logger.log('ユーザー更新エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * 利用回数更新
   */
  incrementVisitCount: function(nameKana, eventDate) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === nameKana) { // name_kana カラム
          const currentVisits = data[i][10] || 0;
          const isFirstVisit = !data[i][9]; // first_visit_date が null
          
          // 利用回数更新
          sheet.getRange(i + 1, 11).setValue(currentVisits + 1); // total_visits
          sheet.getRange(i + 1, 12).setValue(eventDate);         // last_visit_date
          sheet.getRange(i + 1, 14).setValue(new Date());        // updated_at
          
          // 初回利用日設定
          if (isFirstVisit) {
            sheet.getRange(i + 1, 10).setValue(eventDate); // first_visit_date
          }
          
          break;
        }
      }
    } catch (error) {
      Logger.log('利用回数更新エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * ユーザー一覧取得（管理画面用）
   */
  getUsers: function(filters = {}) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const data = sheet.getDataRange().getValues();
      const users = [];
      
      for (let i = 1; i < data.length; i++) {
        const user = {
          user_id: data[i][0],
          name_kana: data[i][1],
          name_kanji: data[i][2],
          area: data[i][3],
          email: data[i][4],
          phone: data[i][5],
          household_total: (data[i][6] || 0) + (data[i][7] || 0),
          total_visits: data[i][10] || 0,
          first_visit_date: data[i][9],
          last_visit_date: data[i][11]
        };
        
        // フィルター適用
        if (filters.area && user.area !== filters.area) continue;
        if (filters.visitCount) {
          const visits = user.total_visits;
          switch (filters.visitCount) {
            case '0': if (visits !== 0) continue; break;
            case '1': if (visits !== 1) continue; break;
            case '2-5': if (visits < 2 || visits > 5) continue; break;
            case '6+': if (visits < 6) continue; break;
          }
        }
        if (filters.search && !user.name_kana.includes(filters.search)) continue;
        
        users.push(user);
      }
      
      // ソート（利用回数降順）
      users.sort((a, b) => b.total_visits - a.total_visits);
      
      return { success: true, data: users };
      
    } catch (error) {
      Logger.log('ユーザー一覧取得エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * ユーザー詳細取得
   */
  getUserDetail: function(data) {
    try {
      const nameKana = data.userId;
      const user = this.findUserByNameKana(nameKana);
      
      if (!user) {
        return { success: false, error: { code: 'USER_NOT_FOUND', message: 'ユーザーが見つかりません' } };
      }
      
      // 予約履歴を取得
      const reservationHistory = ReservationService.getUserReservationHistory(nameKana);
      
      return {
        success: true,
        data: {
          user: user,
          reservationHistory: reservationHistory
        }
      };
      
    } catch (error) {
      Logger.log('ユーザー詳細取得エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * ユーザー統計取得
   */
  getUserStatistics: function() {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.USERS);
      const data = sheet.getDataRange().getValues();
      
      let totalUsers = 0;
      let activeUsers = 0; // 過去6ヶ月以内に利用
      let newUsers = 0;    // 今年度新規
      let totalVisits = 0;
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const fiscalYearStart = new Date();
      if (fiscalYearStart.getMonth() >= 3) { // 4月以降
        fiscalYearStart.setFullYear(fiscalYearStart.getFullYear(), 3, 1); // 今年4月1日
      } else {
        fiscalYearStart.setFullYear(fiscalYearStart.getFullYear() - 1, 3, 1); // 去年4月1日
      }
      
      for (let i = 1; i < data.length; i++) {
        totalUsers++;
        
        const lastVisit = data[i][11];
        const firstVisit = data[i][9];
        const visits = data[i][10] || 0;
        
        totalVisits += visits;
        
        // アクティブユーザー判定
        if (lastVisit && new Date(lastVisit) >= sixMonthsAgo) {
          activeUsers++;
        }
        
        // 新規ユーザー判定
        if (firstVisit && new Date(firstVisit) >= fiscalYearStart) {
          newUsers++;
        }
      }
      
      return {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        newUsers: newUsers,
        averageVisits: totalUsers > 0 ? Math.round((totalVisits / totalUsers) * 10) / 10 : 0
      };
      
    } catch (error) {
      Logger.log('ユーザー統計取得エラー: ' + error.toString());
      return { totalUsers: 0, activeUsers: 0, newUsers: 0, averageVisits: 0 };
    }
  }
};

/**
 * 既存データからの移行用関数（必要に応じて実行）
 */
function migrateExistingUsers() {
  try {
    Logger.log('既存ユーザーデータの移行を開始します...');
    
    // 既存の予約データから一意のユーザーを抽出
    const existingSheet = getExistingSpreadsheet().getSheetByName(CONFIG.LEGACY_SHEETS.RESERVATIONS);
    const existingData = existingSheet.getDataRange().getValues();
    
    const users = new Map();
    
    for (let i = 1; i < existingData.length; i++) {
      const nameKana = existingData[i][3]; // カタカナ氏名のカラムインデックス
      const nameKanji = existingData[i][5]; // 漢字氏名のカラムインデックス
      const area = existingData[i][6];      // 地域のカラムインデックス
      const contact = existingData[i][7];   // 連絡先のカラムインデックス
      
      if (nameKana && !users.has(nameKana)) {
        users.set(nameKana, {
          nameKana: nameKana,
          nameKanji: nameKanji,
          area: area,
          contact: contact
        });
      }
    }
    
    Logger.log(`${users.size} 人のユニークユーザーを検出しました`);
    
    // 新しいシステムに移行（実際の移行は管理者判断で実行）
    // users.forEach(userData => {
    //   UserService.createUser(userData);
    // });
    
    return users.size;
    
  } catch (error) {
    Logger.log('ユーザーデータ移行エラー: ' + error.toString());
    throw error;
  }
}