function createTestEvents() {
  const calendarId = getConfigProperty('CALENDAR_ID'); // カレンダーIDを取得
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log("エラー: 指定されたカレンダーが見つかりません。");
    return;
  }

  // **期待するエアコンON/OFF時間を定義**
  const EXPECTED_AC_ON_TIME = new Date("2025-02-05T08:18:00+09:00"); // エアコンONの時間
  const EXPECTED_AC_OFF_TIME = new Date("2025-02-05T08:20:00+09:00"); // エアコンOFFの時間

  // **CHECKIN / CHECKOUT を逆算**
  const CHECKIN_TIME = new Date(EXPECTED_AC_ON_TIME.getTime() + 30 * 60 * 1000); // エアコンON + 30分
  const CHECKOUT_TIME = new Date(EXPECTED_AC_OFF_TIME.getTime() - 10 * 60 * 1000); // エアコンOFF - 10分

  const testEvents = [
    {
      title: "山田 太郎 様 予約",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(CHECKOUT_TIME)}
PROPERTY: 【067】グラシア上飯田#601`,
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME
    },
    {
      title: "佐藤 花子 様 予約",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(CHECKIN_TIME)}
PROPERTY: 【101】アーバンライフ新宿#802`,
      startTime: CHECKIN_TIME,
      endTime: CHECKIN_TIME
    },
    {
      title: "鈴木 一郎 様 予約",
      description: "", // 説明欄が空
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME
    },
    {
      title: "田中 健 様 予約",
      description: `CHECKIN: 02/05/2025 08:40:00 +0900
CHECKOUT: 02/05/2025 08:50:00 +0900
PROPERTY: 【150】グランドビュー新宿#1201`, // フォーマットエラー
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME
    },
    {
      title: "大島 和樹 様 予約",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(new Date(CHECKIN_TIME.getTime() + 5 * 60 * 1000))}
PROPERTY: 【606】マジェスティック秋葉原#702`,
      startTime: CHECKIN_TIME,
      endTime: new Date(CHECKIN_TIME.getTime() + 5 * 60 * 1000)
    },
    {
      title: "高橋 亮 様 予約",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(CHECKOUT_TIME)}`, // PROPERTYなし
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME
    }
  ];

  testEvents.forEach(event => {
    calendar.createEvent(event.title, event.startTime, event.endTime, { description: event.description });
    Logger.log("イベント作成: " + event.title);
  });

  Logger.log("✅ すべてのテストイベントを作成しました！");
}

// 日時を "YYYY-MM-DD HH:mm:ss +0900" 形式にフォーマットする関数
function formatDateTime(date) {
  return date.toISOString().replace("T", " ").substring(0, 19) + " +0900";
}
