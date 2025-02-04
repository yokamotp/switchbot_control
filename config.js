function setConfigProperties() {

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
