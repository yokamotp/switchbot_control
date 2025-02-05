function controlRemoteDevices(action, deviceIds) {
  action = action.toUpperCase(); // 大文字に変換

  // `deviceIds` の型と内容を確認
  Logger.log(`制御対象のデバイスIDs: ${JSON.stringify(deviceIds)}`);

  // `deviceIds` が文字列の場合、カンマ区切りで分割
  if (typeof deviceIds === "string") {
    deviceIds = deviceIds.split(",").map(id => id.trim());
  }

  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    Logger.log("エラー: デバイスが見つかりません。");
    return false;
  }

  // **ON/OFF コマンドの設定**
  let command;
  if (action === 'ON') {
    command = "turnOn";  // 直接コマンド指定
  } else if (action === 'OFF') {
    command = "turnOff"; // 直接コマンド指定
  } else {
    Logger.log(`エラー: 不正なアクション指定 - ${action}`);
    return false;
  }

  // 設定情報を取得
  const token = getConfigProperty('SWITCHBOT_TOKEN');
  const secret = getConfigProperty('SWITCHBOT_SECRET');
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName(getConfigProperty('SHEET_NAME'));

  let successCount = 0;

  for (let deviceId of deviceIds) {
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
  }
   
  return successCount > 0;
}

function getDevicesByRoom(roomId) {
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName('Devices');
  if (!sheet) {
    Logger.log("エラー: Devices シートが見つかりません。");
    return [];
  }

  const data = sheet.getDataRange().getValues();
  let devices = [];

  for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
    const row = data[i];

    // `roomId` と `deviceId` が正しく取得できるかチェック
    if (!row[columnRoomId] || !row[columnDeviceId]) {
      Logger.log(`警告: デバイス情報が不完全 - ${JSON.stringify(row)}`);
      continue;
    }

    const sheetRoomId = String(row[columnRoomId]).trim(); // roomId (B列)
    const deviceId = String(row[columnDeviceId]).trim(); // deviceId (E列)

    if (sheetRoomId === String(roomId)) {
      devices.push(deviceId);
    }
  }

  // ログ出力（取得したデバイスIDの配列を確認）
  Logger.log(`ROOMID ${roomId} に対応するデバイスIDリスト: ${JSON.stringify(devices)}`);

  return devices;
}


