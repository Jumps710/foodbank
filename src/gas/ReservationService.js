/**
 * 予約管理サービス
 * YYMMDDNNN形式のIDと日次管理を実装
 */

const ReservationService = {
  
  /**
   * 予約作成
   */
  createReservation: function(data) {
    try {
      // 現在予約受付中のパントリーを取得
      const activePantry = PantryService.getCurrentActivePantry();
      if (!activePantry) {
        return {
          success: false,
          error: { code: 'NO_ACTIVE_PANTRY', message: '現在予約受付中のパントリーがありません' }
        };
      }
      
      // 入力値検証
      const validation = this.validateReservationData(data);
      if (!validation.isValid) {
        return { success: false, error: { code: 'VALIDATION_ERROR', message: validation.message } };
      }
      
      // 定員チェック
      const capacityCheck = this.checkCapacity(activePantry);
      if (!capacityCheck.isValid) {
        return { success: false, error: { code: 'CAPACITY_EXCEEDED', message: capacityCheck.message } };
      }
      
      // 重複予約チェック
      const duplicateCheck = this.checkDuplicateReservation(data.nameKana, activePantry.pantry_id);
      if (!duplicateCheck.isValid) {
        return { success: false, error: { code: 'DUPLICATE_RESERVATION', message: duplicateCheck.message } };
      }
      
      // ユーザー作成または更新
      const userId = UserService.findOrCreateUser(data);
      
      // 予約ID生成
      const reservationId = this.generateReservationId(activePantry.event_date);
      
      // 予約データ作成
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const now = new Date();
      
      const reservationData = [
        reservationId,
        activePantry.pantry_id,
        userId,
        data.nameKana,
        activePantry.event_date,
        activePantry.location_address,
        data.requestedItems || '',
        data.babyNeedsSpec || '',
        data.allergies || '',
        (data.cookingEquipment || []).join(', '),
        '',  // support_info
        data.visitCount || 'はじめて',
        data.notes || '',
        'confirmed',
        now
      ];
      
      sheet.appendRow(reservationData);
      
      // 利用回数更新
      UserService.incrementVisitCount(data.nameKana, activePantry.event_date);
      
      // ログ記録
      LogService.log(CONFIG.EVENT_TYPES.RESERVATION_CREATED, {
        pantry_id: activePantry.pantry_id,
        user_name_kana: data.nameKana,
        reservation_id: reservationId,
        event_detail: '予約作成'
      });
      
      // 確認メール送信（メールアドレスがある場合）
      if (data.email || data.contact) {
        this.sendConfirmationEmail(data, activePantry, reservationId);
      }
      
      return {
        success: true,
        data: {
          reservationId: reservationId,
          message: '予約が完了しました'
        }
      };
      
    } catch (error) {
      Logger.log('予約作成エラー: ' + error.toString());
      LogService.logError('reservation_error', error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: 'システムエラーが発生しました' } };
    }
  },
  
  /**
   * 予約ID生成（YYMMDDNNN形式）
   */
  generateReservationId: function(eventDate) {
    try {
      const date = new Date(eventDate);
      const yy = date.getFullYear().toString().slice(-2);
      const mm = ('0' + (date.getMonth() + 1)).slice(-2);
      const dd = ('0' + date.getDate()).slice(-2);
      const prefix = `${yy}${mm}${dd}`;
      
      // 同日の既存予約IDを確認
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const data = sheet.getDataRange().getValues();
      
      let maxSequence = 0;
      for (let i = 1; i < data.length; i++) {
        const existingId = data[i][0];
        if (existingId && existingId.toString().startsWith(prefix)) {
          const sequence = parseInt(existingId.toString().slice(-3));
          if (sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      }
      
      const nextSequence = maxSequence + 1;
      if (nextSequence > 999) {
        throw new Error('当日の予約上限に達しました');
      }
      
      return prefix + ('000' + nextSequence).slice(-3);
      
    } catch (error) {
      Logger.log('予約ID生成エラー: ' + error.toString());
      throw error;
    }
  },
  
  /**
   * 入力値検証
   */
  validateReservationData: function(data) {
    if (!data.nameKana) {
      return { isValid: false, message: 'カタカナ氏名は必須です' };
    }
    
    // カタカナチェック
    const katakanaRegex = /^[ァ-ヴー\s]+$/;
    if (!katakanaRegex.test(data.nameKana)) {
      return { isValid: false, message: 'カタカナ氏名は全角カタカナで入力してください' };
    }
    
    if (!data.area) {
      return { isValid: false, message: '居住地域は必須です' };
    }
    
    if (!data.contact) {
      return { isValid: false, message: '連絡先は必須です' };
    }
    
    if (!data.adults || parseInt(data.adults) < 0) {
      return { isValid: false, message: '大人の人数を正しく入力してください' };
    }
    
    if (!data.children || parseInt(data.children) < 0) {
      return { isValid: false, message: '子供の人数を正しく入力してください' };
    }
    
    if (!data.privacy_consent) {
      return { isValid: false, message: '個人情報の取り扱いに同意してください' };
    }
    
    return { isValid: true };
  },
  
  /**
   * 定員チェック
   */
  checkCapacity: function(pantry) {
    try {
      const reservationCount = this.getReservationCount(pantry.pantry_id);
      
      if (reservationCount >= pantry.capacity_total) {
        return { isValid: false, message: '定員に達しているため予約できません' };
      }
      
      return { isValid: true };
      
    } catch (error) {
      Logger.log('定員チェックエラー: ' + error.toString());
      return { isValid: false, message: '定員チェック中にエラーが発生しました' };
    }
  },
  
  /**
   * 重複予約チェック
   */
  checkDuplicateReservation: function(nameKana, pantryId) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][3] === nameKana && data[i][1] === pantryId && data[i][13] === 'confirmed') {
          return { isValid: false, message: 'すでに予約済みです' };
        }
      }
      
      return { isValid: true };
      
    } catch (error) {
      Logger.log('重複チェックエラー: ' + error.toString());
      return { isValid: false, message: '重複チェック中にエラーが発生しました' };
    }
  },
  
  /**
   * 予約数取得
   */
  getReservationCount: function(pantryId) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const data = sheet.getDataRange().getValues();
      
      let count = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === pantryId && data[i][13] === 'confirmed') {
          count++;
        }
      }
      
      return count;
      
    } catch (error) {
      Logger.log('予約数取得エラー: ' + error.toString());
      return 0;
    }
  },
  
  /**
   * 予約一覧取得
   */
  getReservations: function(data) {
    try {
      const pantryId = data.pantryId;
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const reservationData = sheet.getDataRange().getValues();
      const reservations = [];
      
      for (let i = 1; i < reservationData.length; i++) {
        if (reservationData[i][1] === pantryId) {
          const reservation = {
            reservation_id: reservationData[i][0],
            pantry_id: reservationData[i][1],
            user_id: reservationData[i][2],
            name_kana: reservationData[i][3],
            event_date: reservationData[i][4],
            pickup_location: reservationData[i][5],
            requested_items: reservationData[i][6],
            special_needs: reservationData[i][7],
            allergies: reservationData[i][8],
            cooking_equipment: reservationData[i][9],
            visit_count: reservationData[i][11],
            notes: reservationData[i][12],
            status: reservationData[i][13],
            created_at: reservationData[i][14]
          };
          
          // ユーザー情報を追加取得
          const user = UserService.findUserByNameKana(reservation.name_kana);
          if (user) {
            reservation.name_kanji = user.name_kanji;
            reservation.area = user.area;
            reservation.contact = user.email || user.phone;
            reservation.household_total = (user.household_adults || 0) + (user.household_children || 0);
          }
          
          reservations.push(reservation);
        }
      }
      
      // 作成日時順でソート
      reservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return { success: true, data: reservations };
      
    } catch (error) {
      Logger.log('予約一覧取得エラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * 予約キャンセル
   */
  cancelReservation: function(data) {
    try {
      const reservationId = data.reservationId;
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const reservationData = sheet.getDataRange().getValues();
      
      for (let i = 1; i < reservationData.length; i++) {
        if (reservationData[i][0] === reservationId) {
          // ステータスを cancelled に更新
          sheet.getRange(i + 1, 14).setValue('cancelled');
          
          // ログ記録
          LogService.log(CONFIG.EVENT_TYPES.RESERVATION_CANCELLED, {
            pantry_id: reservationData[i][1],
            user_name_kana: reservationData[i][3],
            reservation_id: reservationId,
            event_detail: '予約キャンセル'
          });
          
          return { success: true, message: '予約をキャンセルしました' };
        }
      }
      
      return { success: false, error: { code: 'RESERVATION_NOT_FOUND', message: '予約が見つかりません' } };
      
    } catch (error) {
      Logger.log('予約キャンセルエラー: ' + error.toString());
      return { success: false, error: { code: 'INTERNAL_ERROR', message: error.toString() } };
    }
  },
  
  /**
   * ユーザーの予約履歴取得
   */
  getUserReservationHistory: function(nameKana) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const data = sheet.getDataRange().getValues();
      const history = [];
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][3] === nameKana) {
          history.push({
            reservation_id: data[i][0],
            pantry_id: data[i][1],
            event_date: data[i][4],
            status: data[i][13],
            created_at: data[i][14]
          });
        }
      }
      
      // 開催日降順でソート
      history.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      
      return history;
      
    } catch (error) {
      Logger.log('予約履歴取得エラー: ' + error.toString());
      return [];
    }
  },
  
  /**
   * 確認メール送信
   */
  sendConfirmationEmail: function(reservationData, pantry, reservationId) {
    try {
      const email = reservationData.email || reservationData.contact;
      if (!email || !email.includes('@')) {
        return; // メールアドレス形式でない場合はスキップ
      }
      
      const subject = `【予約完了】${pantry.title}`;
      const body = `
${reservationData.nameKana} 様

${pantry.title} のご予約が完了いたしました。

■予約情報
予約ID: ${reservationId}
開催日: ${Utilities.formatDate(pantry.event_date, 'JST', 'yyyy年MM月dd日(E)')}
開催時間: ${pantry.event_time}
場所: ${pantry.location}
住所: ${pantry.location_address}
アクセス: ${pantry.location_access}

■注意事項
${pantry.auto_reply_message}

※このメールは自動送信されています。
※ご不明な点がございましたら、お気軽にお問い合わせください。

フードパントリー市川
      `;
      
      MailApp.sendEmail(email, subject, body);
      
    } catch (error) {
      Logger.log('確認メール送信エラー: ' + error.toString());
      // メール送信エラーは予約処理に影響させない
    }
  },
  
  /**
   * 予約統計取得
   */
  getReservationStatistics: function(pantryId) {
    try {
      const sheet = getNewSpreadsheet().getSheetByName(CONFIG.SHEETS.RESERVATIONS);
      const data = sheet.getDataRange().getValues();
      
      let total = 0;
      let household1 = 0;  // 1名世帯
      let household23 = 0; // 2-3名世帯
      let household4plus = 0; // 4名以上世帯
      let newUsers = 0;
      let cancelled = 0;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === pantryId) {
          if (data[i][13] === 'confirmed') {
            total++;
            
            // 世帯人数別集計
            const user = UserService.findUserByNameKana(data[i][3]);
            if (user) {
              const householdTotal = (user.household_adults || 0) + (user.household_children || 0);
              if (householdTotal === 1) {
                household1++;
              } else if (householdTotal >= 2 && householdTotal <= 3) {
                household23++;
              } else if (householdTotal >= 4) {
                household4plus++;
              }
              
              // 新規利用者判定
              if (user.total_visits <= 1) {
                newUsers++;
              }
            }
          } else if (data[i][13] === 'cancelled') {
            cancelled++;
          }
        }
      }
      
      return {
        total: total,
        household1: household1,
        household23: household23,
        household4plus: household4plus,
        newUsers: newUsers,
        cancelled: cancelled
      };
      
    } catch (error) {
      Logger.log('予約統計取得エラー: ' + error.toString());
      return { total: 0, household1: 0, household23: 0, household4plus: 0, newUsers: 0, cancelled: 0 };
    }
  }
};