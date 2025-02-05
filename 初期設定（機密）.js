// 初期設定

  // 定数
  // Spreadsheet Logsの列
  const columnEventId = 0; //EventIDの記録列
  const columnAction = 5; //Action（ON/OFF）の記録列

  // Spreadsheet Devicesの列
  const columnRoomId = 1; // roomId (B列)
  const columnDeviceId = 4; // deviceId (E列)

  // SwitchBot操作コマンド
const ACTION_TURN_ON = "turnOn";
const ACTION_TURN_OFF = "turnOff";
  
// (各取得方法は、手順書に記載してます。)
const INITIAL_CONFIG = {

  // SwitchBot
  SWITCHBOT_TOKEN: 'f9a4ac2f4a1056fed5a331c09bc8d72ed8e2bc1c03de728218ac02538509b9c9c2f401a03dcff5548dbaaa185f241213', // SwitchBot APIトークン
  SWITCHBOT_SECRET: '58bdd0cb73bd71bafc75ae9a6c91baed', // クライアントシークレット
  REMOTE_ID: '02-202501290843-95480840', // 仮想リモコンのデバイスID

  // Google Spreadsheet
  SPREADSHEET_ID: '1N9k3r8RWf5saU5l35SVsVQKJlmn05pgPT7bSQ8iXSis', // GoogleスプレッドシートのID
  SHEET_NAME: 'Logs', // ログ記録用のシート名

  // Google カレンダー
  CALENDAR_ID: 'yohei.okamoto@gmail.com', // GoogleカレンダーID（通常は 'primary'）

  // デバイスの電源チェック用コマンド
  DEVICE_POWER_CHECK_COMMAND: 'lowSpeed' 
};
