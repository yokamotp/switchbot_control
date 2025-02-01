function testCalendarConfig() {
  const calendarId = getConfigProperty('CALENDAR_ID');
  Logger.log("取得したカレンダーID: " + calendarId);

  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log("エラー: カレンダーが見つかりません。IDが正しいか確認してください。");
  } else {
    Logger.log("カレンダー取得成功: " + calendar.getName());
  }
}
