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
    command = ACTION_TURN_ON;
  } else if (action === 'OFF') {
    command = ACTION_TURN_OFF;
  } else {
    Logger.log(`エラー: 不正なアクション指定 - ${action}`);
    return false;
  }

  // 設定情報を取得
  const token = getConfigProperty('SWITCHBOT_TOKEN');
  const secret = getConfigProperty('SWITCHBOT_SECRET');
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName(getConfigProperty('SHEET_NAME'));

  let successCount = 0;
  let errorMessages = [];

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
        const errorMsg = `デバイス ${deviceId} の制御失敗: ${responseJson.message}`;
        Logger.log(`エラー: ${errorMsg}`);
        errorMessages.push(errorMsg);
      }
    } catch (error) {
      const errorMsg = `デバイス ${deviceId} へのリクエスト失敗 - ${error.message}`;
      Logger.log(`エラー: ${errorMsg}`);
      errorMessages.push(errorMsg);
    }
  }

  if (successCount > 0) {
    return { success: true, message: "全デバイス制御成功。" };
  } else {
    return { success: false, message: errorMessages.join("; ") };
  }
}

function getAllDeviceIds() {
  const sheet = SpreadsheetApp.openById(getConfigProperty('SPREADSHEET_ID')).getSheetByName('Devices');
  if (!sheet) {
    Logger.log("エラー: Devices シートが見つかりません。");
    return [];
  }

  // **カラムのインデックスを指定**
  const colDeviceId = columnDeviceId; // （deviceId）

  const data = sheet.getDataRange().getValues();
  let devices = [];
  const lastRow = getLastRowInColumn(sheet, colDeviceId);

  for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
    const row = data[i];

    // **行が空の場合はスキップ**
    if (!row || row.length < lastRow ||  row[colDeviceId] === undefined) {
      continue;
    }

    const deviceId = String(row[colDeviceId]).trim(); // deviceId (E列)
    
    // **空白の場合は追加しない**
     if (deviceId === "") {
      continue;
    }

    devices.push(deviceId);
  }

  // **デバイスリストが正しく取得されたか確認**
  Logger.log(`取得したデバイスIDリスト: ${JSON.stringify(devices)}`);

  return devices;
}

function getLastRowInColumn(sheet, columnIndex) {
  const lastRow = sheet.getLastRow(); // シート全体の最終行を取得
  const columnValues = sheet.getRange(1, columnIndex, lastRow).getValues(); // 指定列の値を取得

  // 下から上に向かってループし、最初に値が入っている行を探す
  for (let i = columnValues.length - 1; i >= 0; i--) {
    if (columnValues[i][0] !== "") {
      return i + 1; // 1-based index に変換
    }
  }
  return 0; // データがない場合
}


