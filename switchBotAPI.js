function controlRemoteDevices(action, roomId) {
  action = action.toUpperCase(); // 大文字に変換

  // ROOMID に対応するデバイスIDを取得
  const deviceIds = getDevicesByRoom(roomId);

  if (deviceIds.length === 0) {
    Logger.log(`エラー: ROOMID ${roomId} に対応するデバイスが見つかりません。`);
    return false;
  }

  // 設定情報を取得
  const token = getConfigProperty('SWITCHBOT_TOKEN');
  const secret = getConfigProperty('SWITCHBOT_SECRET');
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName(getConfigProperty('SHEET_NAME'));

  let successCount = 0;

  deviceIds.forEach(deviceId => {
    // ON/OFF のコマンドを明示的に分離
    let command;
    if (action === 'ON') {
      command = ACTION_TURN_ON;
    } else if (action === 'OFF') {
      command = ACTION_TURN_OFF;
    } else {
      Logger.log(`エラー: 不正なアクション指定 - ${action}`);
      return false;
    }

    // APIエンドポイントとリクエスト設定
    const url = 'https://api.switch-bot.com';
    const path = `/v1.1/devices/${deviceId}/commands`;
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

      Logger.log(`デバイス ${deviceId} のレスポンス: ${responseText}`);

      // 成功時 (`statusCode: 100`)
      if (responseJson.statusCode === 100) {
        Logger.log(`デバイス ${deviceId} 制御成功: ${command}`);
        successCount++;
      } else {
        Logger.log(`エラー: デバイス ${deviceId} の制御失敗: ${responseJson.message}`);
      }
    } catch (error) {
      Logger.log(`エラー: デバイス ${deviceId} へのリクエスト失敗 - ${error.message}`);
    }
  });

  return successCount > 0;
}


function getDevicesByRoom(roomId) {
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName('Devices');
  if (!sheet) {
    Logger.log("エラー: Devices シートが見つかりません。");
    return [];
  }

  const data = sheet.getDataRange().getValues(); // 全データ取得
  let devices = [];

  // デバイス一覧を取得
  for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
    const row = data[i];
    const sheetRoomId = row[columnRoomId]; // roomId (B列)
    const deviceId = row[columnDeviceId]; // deviceId (E列)

    if (String(sheetRoomId) === String(roomId)) {
      devices.push(deviceId);
    }
  }

  return devices;
}

