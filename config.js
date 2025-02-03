function setConfigProperties() {

  // 定数
  // Spreadsheetの列
  const columnEventId = 0; //EventIDの記録列
  const columnAction = 5; //Action（ON/OFF）の記録列

  // ユーザ初期値
  const scriptProperties = PropertiesService.getScriptProperties();

  // 初期値をスクリプトプロパティに保存
  for (let key in INITIAL_CONFIG) {
    scriptProperties.setProperty(key, INITIAL_CONFIG[key]);
  }
  Logger.log("Config properties set successfully!");
}

// 設定値を取得する関数（他のスクリプトで使用）
function getConfigProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
