function parseEventDescription(description) {
  // 正規表現で CHECKIN, CHECKOUT, PROPERTY を取得
  const checkinMatch = description.match(/CHECKIN:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \+\d{4})/);
  const checkoutMatch = description.match(/CHECKOUT:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \+\d{4})/);
  const propertyMatch = description.match(/PROPERTY:\s*(.+)/);

  if (!checkinMatch || !checkoutMatch) {
    Logger.log("CHECKIN または CHECKOUT のデータが見つかりません");
    return null;
  }

  // 日時をDateオブジェクトに変換
  const checkinTime = new Date(checkinMatch[1]);
  const checkoutTime = new Date(checkoutMatch[1]);

  // PROPERTYの値を取得（カンマ区切りの場合、最初の物件のみ取得）
  const property = propertyMatch ? propertyMatch[1].split(',')[0].trim() : "不明";

  return { checkinTime, checkoutTime, property };
}


function getSeasonalMode() {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScriptの月は0始まり（1月 = 0）

  if (month >= 5 && month <= 10) {
    return "cool"; // 5月～10月は冷房
  } else {
    return "heat"; // 11月～4月は暖房
  }
}


function checkCalendarForACControl() {
  const calendarId = getConfigProperty('CALENDAR_ID');
  if (!calendarId) {
    Logger.log("エラー: カレンダーIDが設定されていません。");
    return;
  }

  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log("エラー: 指定されたカレンダーが見つかりません。ID: " + calendarId);
    return;
  }

  const now = new Date();
  Logger.log("===== スクリプト開始: " + now.toLocaleString() + " =====");
  
  const events = calendar.getEvents(now, new Date(now.getTime() + 24 * 60 * 60 * 1000));
  Logger.log("取得したイベント数: " + events.length);

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const description = event.getDescription();
    const calendarTitle = event.getSummary(); // 予定タイトル（予約者名）
    const eventId = event.getId();

Logger.log("処理対象のイベント: "  + calendarTitle);
    if (!description) {
      Logger.log("説明欄がないためスキップ: " + calendarTitle);
      continue;
    }

    const parsedData = parseEventDescription(description);
    if (!parsedData) {
      Logger.log("CHECKIN/CHECKOUTのデータが見つからないためスキップ: " + calendarTitle);
      continue;
    }

    const { checkinTime, checkoutTime, property } = parsedData;
    const currentMode = getSeasonalMode();

    const checkinStart = new Date(checkinTime.getTime() - 30 * 60 * 1000);
    const checkoutEnd = new Date(checkoutTime.getTime() + 10 * 60 * 1000);

    Logger.log("予約情報 - 物件: " + property + ", 予約者: " + calendarTitle);
    Logger.log("CHECKIN時間: " + checkinTime.toLocaleString());
    Logger.log("CHECKOUT時間: " + checkoutTime.toLocaleString());
    Logger.log("現在のモード: " + currentMode);

    // 予約が継続中の部屋があるかどうかを判定
    if (now >= checkinStart && now < checkoutEnd) {
      Logger.log("滞在中の部屋あり");

      // エアコンON
      if (!isEventAlreadyProcessed(eventId, 'ON')) {
        Logger.log("エアコンをONにします (モード: " + currentMode + ")");
        const success = controlRemoteDevice('turnOn');
        if (success) {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'ON');
        } else {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'ERROR: ON コマンド失敗');
        }
      } else {
        Logger.log("エアコンONは既に実行済み: " + property);
      }
    }

    // CHECKOUT 10分後を過ぎたらエアコンOFF
    if (now >= checkoutTime && now < checkoutEnd) {
      if (!isEventAlreadyProcessed(eventId, 'OFF')) {
        Logger.log("エアコンをOFFにします");
        const success = controlRemoteDevice('turnOff');
        if (success) {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'OFF');
        } else {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'ERROR: OFF コマンド失敗');
        }
      } else {
        Logger.log("エアコンOFFは既に実行済み: " + property);
      }
    }
  }

  Logger.log("===== スクリプト終了: " + now.toLocaleString() + " =====");
}

