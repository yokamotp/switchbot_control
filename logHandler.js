// ログをスプレッドシートに記録する関数
function logACAction(eventId, eventTitle, calendarTitle, checkinTime, checkoutTime, action) {
  const spreadsheetId = getConfigProperty('SPREADSHEET_ID');
  const sheetName = getConfigProperty('SHEET_NAME');

  if (!spreadsheetId || !sheetName) {
    Logger.log("エラー: スプレッドシートIDまたはシート名が設定されていません。");
    return;
  }

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("エラー: 指定されたシートが見つかりません: " + sheetName);
    return;
  }

  // スプレッドシートに記録
  sheet.appendRow([eventId, eventTitle, calendarTitle, checkinTime, checkoutTime, action, new Date()]);
}


// 指定したイベントが既に実行済みかをチェック
function isEventAlreadyProcessed(eventId, action) {
  const spreadsheetId = getConfigProperty('SPREADSHEET_ID'); // Config.gs から取得
  const sheetName = getConfigProperty('SHEET_NAME'); // Config.gs から取得

  if (!spreadsheetId || !sheetName) {
    Logger.log("エラー: スプレッドシートIDまたはシート名が設定されていません。");
    return false;
  }

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("エラー: 指定されたシートが見つかりません: " + sheetName);
    return false;
  }

  const data = sheet.getDataRange().getValues(); // すべてのデータを取得
  for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
    if (data[i][0] === eventId && data[i][3] === action) {
      return true; // すでに同じイベントのON/OFFが実行済み
    }
  }
  return false;
}
