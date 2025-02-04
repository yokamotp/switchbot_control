// デバイス一覧を取得する関数
function getDeviceInfo() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // 認証情報を取得
  const token = scriptProperties.getProperty('SWITCHBOT_TOKEN');
  const secret = scriptProperties.getProperty('SWITCHBOT_SECRET');

  // APIエンドポイントとリクエスト設定
  const url = 'https://api.switch-bot.com';
  const path = '/v1.1/devices';
  const timestamp = new Date().getTime().toString(); // 現在時刻（ミリ秒）
  const nonce = Utilities.getUuid(); // UUIDを生成

  // HMAC-SHA256署名を生成
  let sign = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    token + timestamp + nonce,
    secret
  );
  sign = Utilities.base64Encode(sign).toUpperCase(); // Base64エンコード後に大文字化

  // HTTPヘッダーを作成
  const headers = {
    'Authorization': token,
    'sign': sign,
    't': timestamp,
    'nonce': nonce,
  };

  // APIリクエストオプションを設定
  const options = {
    method: 'get',
    headers: headers,
  };

  try {
    // APIリクエストを実行
    const response = UrlFetchApp.fetch(url + path, options);
    const responseText = response.getContentText();
    Logger.log('Device Info Response: ' + responseText); // レスポンスをログに出力
    return JSON.parse(responseText); // JSON形式で返却
  } catch (error) {
    Logger.log('Error getting device info: ' + error.message); // エラー時にログ出力
    throw new Error('Failed to fetch device info');
  }
}

// デバイスを操作する関数（例: エアコンON/OFF）
function controlDevice(deviceId, command) {
  const scriptProperties = PropertiesService.getScriptProperties();

  // 認証情報を取得
  const token = scriptProperties.getProperty('SWITCHBOT_TOKEN');
  const secret = scriptProperties.getProperty('SWITCHBOT_SECRET');

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
  sign = Utilities.base64Encode(sign).toUpperCase(); // Base64エンコード後に大文字化

  // HTTPヘッダーを作成
  const headers = {
    'Authorization': token,
    'sign': sign,
    't': timestamp,
    'nonce': nonce,
  };

  // リクエストボディを作成
  const payload = JSON.stringify({
    command: command, // 'turnOn' または 'turnOff'
    parameter: 'default',
    commandType: 'command',
  });

  // APIリクエストオプションを設定
  const options = {
    method: 'post',
    headers: headers,
    payload: payload,
    contentType: 'application/json',
  };

  try {
    // APIリクエストを実行
    const response = UrlFetchApp.fetch(url + path, options);
    const responseText = response.getContentText();
    Logger.log('Control Device Response: ' + responseText); // レスポンスをログに出力
    return JSON.parse(responseText); // JSON形式で返却
  } catch (error) {
    Logger.log('Error controlling device: ' + error.message); // エラー時にログ出力
    throw new Error('Failed to control device');
  }
}
