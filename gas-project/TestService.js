/**
 * テストとデバッグ用のサービス
 * スプレッドシートアクセス権限の確認とデータ取得テスト
 */

/**
 * スプレッドシートアクセステスト
 */
function testSpreadsheetAccess() {
  try {
    console.log('=== スプレッドシートアクセステスト開始 ===');
    
    const spreadsheetId = '1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU';
    console.log('テスト対象スプレッドシートID: ' + spreadsheetId);
    
    // スプレッドシートへのアクセス試行
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('✅ スプレッドシートアクセス成功');
    console.log('スプレッドシート名: ' + spreadsheet.getName());
    
    // シート一覧の取得
    const sheets = spreadsheet.getSheets();
    console.log('シート数: ' + sheets.length);
    
    sheets.forEach((sheet, index) => {
      console.log(`シート${index + 1}: ${sheet.getName()} (行数: ${sheet.getLastRow()})`);
    });
    
    // 既存の予約データシートの確認
    const reservationSheet = spreadsheet.getSheetByName('パントリー予約');
    if (reservationSheet) {
      console.log('✅ 既存予約データシート発見');
      console.log('データ行数: ' + reservationSheet.getLastRow());
      
      // 最初の数行のデータを確認
      if (reservationSheet.getLastRow() > 1) {
        const sampleData = reservationSheet.getRange(1, 1, Math.min(3, reservationSheet.getLastRow()), 5).getValues();
        console.log('サンプルデータ: ');
        console.log(sampleData);
      }
    } else {
      console.log('⚠️ 既存予約データシートが見つかりません');
    }
    
    return {
      success: true,
      message: 'スプレッドシートアクセス成功',
      spreadsheetName: spreadsheet.getName(),
      sheetCount: sheets.length,
      sheetNames: sheets.map(sheet => sheet.getName())
    };
    
  } catch (error) {
    console.error('❌ スプレッドシートアクセスエラー: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      errorType: error.name || 'Unknown'
    };
  }
}

/**
 * 簡単なダッシュボードデータ取得テスト
 */
function testGetDashboardData() {
  try {
    console.log('=== ダッシュボードデータ取得テスト開始 ===');
    
    const spreadsheet = SpreadsheetApp.openById('1XyNivqVU8J6pyF9CA5XNmkv40rAedsnKGdRAn3qniAU');
    
    // 既存データから統計を取得
    const reservationSheet = spreadsheet.getSheetByName('パントリー予約');
    
    if (!reservationSheet) {
      return {
        success: false,
        error: '予約データシートが見つかりません'
      };
    }
    
    const dataRange = reservationSheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    const dataRows = values.slice(1);
    
    console.log('データ行数: ' + dataRows.length);
    
    // 簡単な統計計算
    const stats = {
      totalReservations: dataRows.length,
      totalUsers: [...new Set(dataRows.map(row => row[getColumnIndex(headers, '氏名（カタカナ・フルネームでお願いします）')]))].length,
      latestReservation: dataRows.length > 0 ? dataRows[dataRows.length - 1][0] : null
    };
    
    console.log('統計データ: ', stats);
    
    return {
      success: true,
      data: stats,
      message: 'ダッシュボードデータ取得成功'
    };
    
  } catch (error) {
    console.error('❌ ダッシュボードデータ取得エラー: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * カラムインデックス取得ヘルパー
 */
function getColumnIndex(headers, columnName) {
  const index = headers.indexOf(columnName);
  return index >= 0 ? index : -1;
}

/**
 * Web API用のテスト関数
 */
function doGet(e) {
  const page = e.parameter.page;
  
  if (page === 'test') {
    const testResult = testSpreadsheetAccess();
    
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <title>スプレッドシートアクセステスト</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .success { color: green; }
            .error { color: red; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>スプレッドシートアクセステスト結果</h1>
          <div class="${testResult.success ? 'success' : 'error'}">
            <h2>ステータス: ${testResult.success ? '成功' : '失敗'}</h2>
            <pre>${JSON.stringify(testResult, null, 2)}</pre>
          </div>
          
          <hr>
          
          <h2>ダッシュボードデータテスト</h2>
          <button onclick="testDashboard()">ダッシュボードデータ取得テスト</button>
          <div id="dashboardResult"></div>
          
          <script>
            function testDashboard() {
              google.script.run
                .withSuccessHandler(function(result) {
                  document.getElementById('dashboardResult').innerHTML = 
                    '<div class="' + (result.success ? 'success' : 'error') + '">' +
                    '<pre>' + JSON.stringify(result, null, 2) + '</pre>' +
                    '</div>';
                })
                .withFailureHandler(function(error) {
                  document.getElementById('dashboardResult').innerHTML = 
                    '<div class="error">エラー: ' + error + '</div>';
                })
                .testGetDashboardData();
            }
          </script>
        </body>
      </html>
    `);
  }
  
  // 元のルーティング処理に戻る（省略）
  return HtmlService.createHtmlOutput('<h1>テストページ: ?page=test でアクセスしてください</h1>');
}