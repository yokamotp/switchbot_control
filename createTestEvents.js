function createTestEvents() {
  const calendarId = getConfigProperty('CALENDAR_ID'); // カレンダーIDを取得
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log("エラー: 指定されたカレンダーが見つかりません。");
    return;
  }

  // **エアコン ON / OFF の期待時間を設定**
  const EXPECTED_AC_ON_TIME = new Date("2025-02-05T08:45:00"); // エアコンONの時間
  const EXPECTED_AC_OFF_TIME = new Date("2025-02-05T08:48:00"); // エアコンOFFの時間

  // **CHECKIN / CHECKOUT の時間をエアコンON/OFFから逆算**
  const CHECKIN_TIME = new Date(EXPECTED_AC_ON_TIME.getTime() + 30 * 60 * 1000); // ON時間の30分後
  let CHECKOUT_TIME = new Date(EXPECTED_AC_OFF_TIME.getTime() - 10 * 60 * 1000); // OFF時間の10分前

  const testEvents = [
    // ✅ **正常系: 終日イベント（エアコンON/OFFあり）**
    {
      title: "【テスト01】終日イベント (エアコンON/OFFあり)",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(CHECKOUT_TIME)}
PROPERTY: 【067】グラシア上飯田#601
ROOMID: 101`,
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME,
      isAllDay: true // 終日イベント
    },
    // ✅ **正常系: 通常の予約（エアコンON 8:30, OFF 8:35）**
    {
      title: "【テスト02】通常の予約 (エアコンON 8:30, OFF 8:35)",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(CHECKOUT_TIME)}
PROPERTY: 【101】アーバンライフ新宿#802
ROOMID: 101`,
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME,
      isAllDay: true
    },
    // ❌ **異常系: 説明欄が空**
    {
      title: "【テスト03】説明欄が空 (エラー期待)",
      description: "", // 説明欄が空
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME,
      isAllDay: true
    },
    // ❌ **異常系: CHECKIN / CHECKOUT のフォーマットエラー**
    {
      title: "【テスト04】日時フォーマットエラー (エラー期待)",
      description: `CHECKIN: 2025-02-05 08:40:00
CHECKOUT: 2025-02-05 08:50:00
PROPERTY: 【150】グランドビュー新宿#1201
ROOMID: 101`, // フォーマットエラー
      startTime: CHECKIN_TIME,
      endTime: CHECKOUT_TIME,
      isAllDay: true
    },
    // ✅ **正常系: 5分間だけの予約**
    {
      title: "【テスト05】5分間の予約 (エアコンON 8:30, OFF 8:35)",
      description: `CHECKIN: ${formatDateTime(CHECKIN_TIME)}
CHECKOUT: ${formatDateTime(new Date(CHECKIN_TIME.getTime() + 5 * 60 * 1000))}
PROPERTY: 【606】マジェスティック秋葉原#702
ROOMID: 101`,
      startTime: CHECKIN_TIME,
      endTime: new Date(CHECKIN_TIME.getTime() + 5 * 60 * 1000),
      isAllDay: true
    }
  ];

  testEvents.forEach(event => {
    if (event.isAllDay) {
      // **終日イベントの作成**
      calendar.createAllDayEvent(event.title, event.startTime, { description: event.description });
    } else {
      // **通常のイベントの作成**
      calendar.createEvent(event.title, event.startTime, event.endTime, { description: event.description });
    }
    Logger.log("イベント作成: " + event.title);
  });

  Logger.log("✅ すべてのテストイベントを作成しました！");
}

// **日本時間のフォーマット (タイムゾーン情報なし)**
function formatDateTime(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
