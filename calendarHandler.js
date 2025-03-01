function parseEventDescription(description) {
  // 正規表現で CHECKIN, CHECKOUT, PROPERTY を取得
  const checkinMatch = description.match(/CHECKIN:\s*(\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2})/);
  const checkoutMatch = description.match(/CHECKOUT:\s*(\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2})(?:\s*\+\d{4})?/);
  const propertyMatch = description.match(/PROPERTY:\s*(.+)/);

  Logger.log(`正規表現で取得したcheckIn: ${checkinMatch}`);
  Logger.log(`正規表現で取得したcheckOut: ${checkoutMatch}`);


  if (!checkinMatch || !checkoutMatch) {
    Logger.log("CHECKIN または CHECKOUT のデータが見つかりません");
    return null;
  }

  // 日時文字列を取得し、`Date` オブジェクトに変換
  const checkinTime = new Date(checkinMatch[1] + " GMT+0900"); 
  const checkoutTime = new Date(checkoutMatch[1] + " GMT+0900");

  // PROPERTYの値を取得（カンマ区切りの場合、最初の物件のみ取得）
  const property = propertyMatch ? propertyMatch[1].split(',')[0].trim() : "不明";

  // ログで確認
  Logger.log(`解析結果 - PROPERTY: ${property}`);

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

  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
  const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24時間後
  const events = calendar.getEvents(oneDayAgo, oneDayLater, { timeZone: 'Asia/Tokyo'});
  Logger.log("取得したイベント数: " + events.length);

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const description = event.getDescription();
    const eventTitle = event.getSummary(); // 予定のタイトル
    const eventId = event.getId();

    Logger.log("処理対象のイベント: " + eventTitle);
    
    if (!description) {
      Logger.log("説明欄がないためスキップ: " + eventTitle);
      continue;
    }

    const parsedData = parseEventDescription(description);
    if (!parsedData) {
      Logger.log("CHECKIN/CHECKOUTのデータが見つからないためスキップ: " + eventTitle);
      continue;
    }

    const { checkinTime, checkoutTime, property } = parsedData;
    
    //デバイス一覧を取得
    const deviceIds = getAllDeviceIds();
    if (deviceIds.length === 0) {
      Logger.log(`エラー: デバイスが見つかりません。`);
      continue;
    }
    const checkinStart = new Date(checkinTime.getTime() - 30 * 60 * 1000);
    const checkoutPlus10 = new Date(checkoutTime.getTime() + 10 * 60 * 1000); // CHECKOUT + 10分
    const checkoutPlus60 = new Date(checkoutTime.getTime() + 60 * 60 * 1000); // CHECKOUT + 1時間

    Logger.log("CHECKIN時間: " + checkinTime.toLocaleString());
    Logger.log("CHECKOUT時間: " + checkoutTime.toLocaleString());
    
    if (now >= checkinStart && now < checkinTime) {
      Logger.log("ON対象の部屋あり");

      if (!isEventAlreadyProcessed(eventId, 'ON')) {
        Logger.log("ログに実行履歴がないため、デバイスをONにします");
        const controlResult  = controlRemoteDevices('ON', deviceIds);
        if (controlResult.success) {
          logACAction(eventId, property, eventTitle, checkinTime, checkoutTime, 'ON');
        } else {
          logACAction(eventId, property, eventTitle, checkinTime, checkoutTime, `ERROR: ON コマンド失敗 - ${controlResult.message}`);
        }
      } else {
        Logger.log("エアコンONは既に実行済み: " + property);
      }
    }

    if (now >= checkoutPlus10 && now < checkoutPlus60) {
      Logger.log("OFF対象の部屋あり");
      if (!isEventAlreadyProcessed(eventId, 'OFF')) {
        Logger.log("ログに実行履歴がないため、デバイスをOFFにします");
        const controlResult  = controlRemoteDevices('OFF', deviceIds);
        if (controlResult.success) {
          logACAction(eventId, property, eventTitle, checkinTime, checkoutTime, 'OFF');
        } else {
          logACAction(eventId, property, eventTitle, checkinTime, checkoutTime, `ERROR: OFF コマンド失敗 - ${controlResult.message}`);
        }
      } else {
        Logger.log("エアコンOFFは既に実行済み: " + property);
      }
    }
  }
  Logger.log("===== スクリプト終了: " + now.toLocaleString() + " =====");
}

