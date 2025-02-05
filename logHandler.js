// ログをスプレッドシートに記録する関数
function logACAction(eventId, property,eventTitle, checkinTime, checkoutTime, action) {
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

  sheet.appendRow([eventId,property ,eventTitle, checkinTime, checkoutTime, action, new Date()]); //順番は変更不可。実行済みかチェックする際に列を定数で指定している。
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
    if (data[i][columnEventId] === eventId && data[i][columnAction] === action) {
      return true; // すでに同じイベントのON/OFFが実行済み
    }
  }
  return false;
}


