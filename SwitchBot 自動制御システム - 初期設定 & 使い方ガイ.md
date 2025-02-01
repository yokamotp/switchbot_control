# SwitchBot 自動制御システム - 初期設定 & 使い方ガイド

---

## 📌 1. システム概要
本システムは **SwitchBot API** を活用し、Googleカレンダーの予定に応じて **扇風機やエアコンを自動制御** するツールです。  
クラウド上で動作し、事前に設定したルールに従って自動でデバイスをON/OFFします。

### ✅ 主な機能
- **Googleカレンダーと連携** し、予約スケジュールに基づいてデバイスを制御  
- **SwitchBot API を使用** し、クラウド経由でデバイスをON/OFF  
- **ログをGoogleスプレッドシートに保存** し、実行履歴を確認可能  
- **現在のデバイスの電源状態を自動判定** し、不要なON/OFF操作を防止  

---

## 📌 2. 初期設定手順

### 🔹 必要なもの
- **SwitchBot ハブミニ**（Wi-Fi 接続済み）  
- **SwitchBot アプリ（クラウドサービスを有効化）**  
- **Googleアカウント（GAS & スプレッドシートの利用）**  
- **Googleカレンダーの予定を利用する（例：宿泊施設の予約情報など）**  

---

### 📌 2.1 SwitchBot API の設定
1. **SwitchBot アプリを開く**
2. **「プロフィール」→「設定」→「開発者オプション」** に移動  
3. **「クラウドサービス」を有効化**（これをしないと API が使えません）  
4. **「トークンを取得」ボタンをタップし、APIトークンをコピー**  
5. **「クライアントシークレット」もコピー**（後でGASに登録します）

---

### 📌 2.2 Google Apps Script（GAS）のセットアップ
1. **Google Drive を開く**
2. **「新規作成」→「Google Apps Script」を選択**
3. **「プロジェクトのプロパティ」→「スクリプト ID」をメモ**
4. **ターミナルで `clasp` を使ってリモート接続**
    ```sh
    clasp login
    clasp clone {スクリプトID}
    ```
5. **`初期設定（機密）.gs` を開き、APIトークンなどを入力**
6. **保存後、`clasp push` で変更を反映**

---

### 📌 2.3 `初期設定（機密）.gs` の編集
以下のように **APIトークン、デバイスID、GoogleスプレッドシートのID** などを設定してください。

```javascript
// 初期設定（機密）.gs
const INITIAL_CONFIG = {

  // SwitchBot API 認証情報
  SWITCHBOT_TOKEN: 'xx-xxxxx-xxxxx', // SwitchBot APIトークン
  SWITCHBOT_SECRET: 'xx-xxxxx-xxxxx', // クライアントシークレット
  REMOTE_ID: '02--95480840', // 仮想リモコンのデバイスID（SwitchBotアプリで確認）

  // Google Spreadsheet
  SPREADSHEET_ID: 'xx-xxxxx-xxxxx', // ログ記録用スプレッドシートID
  SHEET_NAME: 'Logs', // ログを保存するシート名

  // Google カレンダーの設定
  CALENDAR_ID: 'your-calendar@gmail.com', // GoogleカレンダーのID（通常は 'primary'）

  // デバイスの電源チェック用コマンド
  DEVICE_POWER_CHECK_COMMAND: 'lowSpeed' // ON/OFF 判定用のコマンド（デバイスに応じて変更）
};