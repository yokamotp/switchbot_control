

function controlRemoteDevice(action, eventId, eventTitle, roomName, calendarTitle, checkinTime, checkoutTime) {
  // 設定情報を取得
  const token = getConfigProperty('SWITCHBOT_TOKEN');
  const secret = getConfigProperty('SWITCHBOT_SECRET');
  const remoteId = getConfigProperty('REMOTE_ID');
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName(getConfigProperty('SHEET_NAME'));

  // 既に実行済みか確認
  if (isEventAlreadyProcessed(eventId, action)) {
    Logger.log('スキップ: すでに実行済みのアクション - ' + action);
    return false;
  }

  // ON/OFF のコマンドを明示的に分離
  let command;
  if (action === 'ON') {
    command = 'turnOn';
  } else if (action === 'OFF') {
    command = 'turnOff';
  } else {
    Logger.log('エラー: 不正なアクション指定 - ' + action);
    return false;
  }

  // APIエンドポイントとリクエスト設定
  const url = 'https://api.switch-bot.com';
  const path = `/v1.1/devices/${remoteId}/commands`;
  const timestamp = new Date().getTime().toString(); // 現在時刻（ミリ秒）
  const nonce = Utilities.getUuid(); // UUIDを生成

  // HMAC-SHA256署名を生成
  let sign = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    token + timestamp + nonce,
    secret
  );
  sign = Utilities.base64Encode(sign).toUpperCase();

  // HTTPヘッダーを作成
  const headers = {
    'Authorization': token,
    'sign': sign,
    't': timestamp,
    'nonce': nonce,
  };

  // リクエストボディを作成
  const payload = JSON.stringify({
    command: command,
    parameter: 'default',
    commandType: 'command',
  });

  const options = {
    method: 'post',
    headers: headers,
    payload: payload,
    contentType: 'application/json',
  };

  try {
    const response = UrlFetchApp.fetch(url + path, options);
    const responseText = response.getContentText();
    const responseJson = JSON.parse(responseText);

    Logger.log('Control Remote Device Response: ' + responseText);

    // 成功時 (`statusCode: 100`)
    if (responseJson.statusCode === 100) {
      Logger.log('デバイス制御成功: ' + command);
      logACAction(eventId, eventTitle, calendarTitle, checkinTime, checkoutTime, action); // スプレッドシートに記録
      return true;
    } else {
      Logger.log('エラー: SwitchBot API からエラー応答: ' + responseJson.message);
      return false;
    }
  } catch (error) {
    Logger.log('エラー: SwitchBot API リクエスト失敗 - ' + error.message);
    return false;
  }
}