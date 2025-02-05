function parseEventDescription(description) {
  // 正規表現で CHECKIN, CHECKOUT, PROPERTY, ROOMID を取得
  const checkinMatch = description.match(/CHECKIN:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(?:\s*\+\d{4})?/);
  const checkoutMatch = description.match(/CHECKOUT:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(?:\s*\+\d{4})?/);
  const propertyMatch = description.match(/PROPERTY:\s*(.+)/);
  const roomIdMatch = description.match(/ROOMID:\s*(\d+)/);

  if (!checkinMatch || !checkoutMatch) {
    Logger.log("CHECKIN または CHECKOUT のデータが見つかりません");
    return null;
  }

  // 日時文字列を取得し、時差情報 (+0900) を削除して `Date` オブジェクトに変換
  const checkinTime = new Date(checkinMatch[1]); 
  const checkoutTime = new Date(checkoutMatch[1]); 

  // PROPERTYの値を取得（カンマ区切りの場合、最初の物件のみ取得）
  const property = propertyMatch ? propertyMatch[1].split(',')[0].trim() : "不明";

  // ROOMID の値を取得（数値として扱う）
  const roomId = roomIdMatch ? parseInt(roomIdMatch[1], 10) : null;

  return { checkinTime, checkoutTime, property, roomId };
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

    const { checkinTime, checkoutTime, roomId } = parsedData;
    
    if (!roomId) {
      Logger.log("ROOMID が見つからないためスキップ: " + eventTitle);
      continue;
    }

    // 部屋に紐づくデバイス一覧を取得
    const deviceIds = getDevicesByRoom(roomId);
    if (deviceIds.length === 0) {
      Logger.log(`エラー: ROOMID ${roomId} に対応するデバイスが見つかりません。`);
      continue;
    }

    const checkinStart = new Date(checkinTime.getTime() - 30 * 60 * 1000);
    const checkoutEnd = new Date(checkoutTime.getTime() + 10 * 60 * 1000);


    Logger.log("予約情報 - 物件: " + property + ", 予約者: " + calendarTitle);
    Logger.log("CHECKIN時間: " + checkinTime.toLocaleString());
    Logger.log("CHECKOUT時間: " + checkoutTime.toLocaleString());
    Logger.log("現在のモード: " + currentMode);
    Logger.log(`予約情報 - ROOMID: ${roomId}`);
    
    // 予約が継続中の部屋があるかどうかを判定
    if (now >= checkinStart && now < checkoutEnd) {
      Logger.log("滞在中の部屋あり");

      if (!isEventAlreadyProcessed(eventId, 'ON')) {
        Logger.log(`ROOMID ${roomId} のデバイスをONにします`);
        Logger.log("エアコンをONにします (モード: " + currentMode + ")");
        const success = controlRemoteDevice('ON',deviceIds);
        if (success) {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'ON');
        } else {
          logACAction(eventId, property, calendarTitle, checkinTime, checkoutTime, 'ERROR: ON コマンド失敗');
        }
      } else {
        Logger.log("エアコンONは既に実行済み: " + property);
      }
    }

    // CHECKOUT 10分後を過ぎたらデバイスOFF
    if (now >= checkoutTime && now < checkoutEnd) {
      if (!isEventAlreadyProcessed(eventId, 'OFF')) {
        Logger.log(`ROOMID ${roomId} のデバイスをOFFにします`);
        const success = controlRemoteDevices('OFF', deviceIds);
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

