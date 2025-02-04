function testLogACAction() {
  Logger.log("=== testLogACAction 開始 ===");

  const testEventId = "test-event-123";
  const testEventTitle = "Test Event";
  const testCalendarTitle = "Test Calendar";
  const testCheckinTime = new Date();
  const testCheckoutTime = new Date(testCheckinTime.getTime() + 60 * 60 * 1000); // 1時間後
  const testAction = "ON";

  logACAction(testEventId, testEventTitle, testCalendarTitle, testCheckinTime, testCheckoutTime, testAction);
  Logger.log("スプレッドシートにデータが記録されたことを確認してください。");
}

function testIsEventAlreadyProcessed() {
  Logger.log("=== testIsEventAlreadyProcessed 開始 ===");

  const testEventId = "test-event-123";
  const testAction = "ON";

  const result = isEventAlreadyProcessed(testEventId, testAction);
  Logger.log(`isEventAlreadyProcessed の結果: ${result}`);

  if (result) {
    Logger.log("テスト成功: 既に実行済みのイベントが正しく検出されました。");
  } else {
    Logger.log("テスト失敗: 実行履歴にあるイベントが検出されませんでした。");
  }
}
