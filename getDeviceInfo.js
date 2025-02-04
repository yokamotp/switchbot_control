function getDeviceInfo() {
  // 必要な情報を設定
  const url = 'https://api.switch-bot.com'; // APIベースURL
  const path = '/v1.1/devices'; // エンドポイント
  const token = 'YOUR_SWITCHBOT_TOKEN'; // SwitchBot APIトークン
  const secret = 'YOUR_CLIENT_SECRET'; // クライアントシークレット

  // 現在のタイムスタンプ（ミリ秒単位）
  const timestamp = new Date().getTime().toString();

  // 一意なnonce（UUIDを生成）
  const nonce = Utilities.getUuid();

  // 署名を生成（HMAC-SHA256 + Base64エンコード + 大文字変換）
  let sign = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    token + timestamp + nonce,
    secret
  );
  sign = Utilities.base64Encode(sign).toUpperCase();

  // 認証用ヘッダーを作成
  const headers = {
    'Authorization': token,
    'sign': sign,
    't': timestamp,
    'nonce': nonce,
  };

  // APIリクエストのオプション
  const options = {
    method: 'get',
    headers: headers,
  };

  // APIを呼び出してレスポンスを取得
  try {
    const response = UrlFetchApp.fetch(url + path, options);
    const responseText = response.getContentText();
    Logger.log('Response: ' + responseText); // レスポンスをログに出力
  } catch (error) {
    Logger.log('Error: ' + error.message); // エラーをログに出力
  }
}
