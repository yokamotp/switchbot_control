
function testCommands() {
  const commands = [
    //"turnOn",
    //"turnOff",
    "setMode",
    "setAllSettings",
    "setSpeed",
    "speedUp",
    "speedDown",
    "風量1",
    "fanSpeed1",
    "setWindSpeed",
    "setWindMode",
    "lowSpeed",
    "middleSpeed",
    "highSpeed"

  ];

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    Logger.log(`Testing command: ${command}`);  // どのコマンドをテストするかログ出力
    const result = testSendCommand(command);
    Logger.log(`Command: ${command}, Result: ${result}`);
  }

  Logger.log("📌 どのコマンドが実行できるか確認してください！");
}

function testSendCommand(command) {
  if (!command) {
    Logger.log("エラー: command が undefined です！");
    return false;
  }

  const token = getConfigProperty('SWITCHBOT_TOKEN');
  const secret = getConfigProperty('SWITCHBOT_SECRET');
  const remoteId = getConfigProperty('REMOTE_ID'); // 扇風機のID

  const url = 'https://api.switch-bot.com';
  const path = `/v1.1/devices/${remoteId}/commands`;
  const timestamp = new Date().getTime().toString();
  const nonce = Utilities.getUuid();

  let sign = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    token + timestamp + nonce,
    secret
  );
  sign = Utilities.base64Encode(sign).toUpperCase();

  const headers = {
    'Authorization': token,
    'sign': sign,
    't': timestamp,
    'nonce': nonce,
  };

  const payload = JSON.stringify({
    command: command, // コマンドが undefined にならないことを確認
    parameter: "default",
    commandType: "command"
  });

  const options = {
    method: 'post',
    headers: headers,
    payload: payload,
    contentType: 'application/json',
  };

  try {
    const response = UrlFetchApp.fetch(url + path, options);
    const responseJson = JSON.parse(response.getContentText());

    Logger.log(`Test Command: ${command}`);
    Logger.log("Response: " + JSON.stringify(responseJson));

    if (responseJson.statusCode === 100) {
      Logger.log(`コマンド ${command} が成功しました！`);
      return true;
    } else {
      Logger.log(`コマンド ${command} は無効または失敗しました。`);
      return false;
    }
  } catch (error) {
    Logger.log(`エラー: コマンド ${command} の送信に失敗しました - ` + error.message);
    return false;
  }
}

function testTurnOn() {
  Logger.log("Testing ON command");
  testSendCommand("turnOn");
}

function testTurnOff() {
  Logger.log("Testing OFF command");
  testSendCommand("turnOff");
}