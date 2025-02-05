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

### 🔹 必要なもの/準備
- **SwitchBot ハブミニ**（Wi-Fi 接続済み）  
- **SwitchBot アプリ（クラウドサービスを有効化）**  
- **Googleアカウント（GAS & スプレッドシートの利用）**  
- **Googleカレンダーの予定（定型の形式での予約情報）を利用する（例：宿泊施設の予約情報など）**  

---

### 📌 2.1 SwitchBot API の設定
SwitchBot API を使用するために、API認証に必要な **トークン** と **シークレット** を取得します。

#### **🔹 API トークン & シークレットの取得手順**
1. **SwitchBot アプリを開く**
2. **[プロフィール] タブから [設定] を開く**
3. **[アプリバージョン] を数回連続でタップ**（5回以上）  
   - すると、隠しメニュー **[開発者向けオプション]** が表示される  
4. **[開発者向けオプション] を開く**
5. **トークンとシークレットが表示されるのでコピー**
   - これらは **GAS の設定ファイル (`初期設定（機密）.gs`)** に登録する

🚨 **注意**:  
- **トークンとシークレットは機密情報なので、安全に管理してください！**
- **第三者に漏れないようにすること！**

---
### 📌 2. Googleスプレッドシートの作成
このシステムでは、実行ログを Googleスプレッドシートに保存します。  
以下の手順でスプレッドシートを作成し、`SPREADSHEET_ID` を取得・設定してください。

#### **🔹 スプレッドシートの作成手順**
1. **Google スプレッドシートを開く**（[Google Sheets](https://docs.google.com/spreadsheets/u/0/)）
2. **新しいスプレッドシートを作成**
3. **「ファイル」 → 「名前を変更」で、適当な名前（例: `SwitchBot Logs`）をつける**
4. **シート名を `Logs` に変更**
5. **以下のヘッダー行を設定**
   
   - `Event ID`: GoogleカレンダーのイベントID  
   - `部屋名(Event Title)`: 予約のイベントタイトル（例: 「Joyce Huang (HM3JPB3M8D)」）  
   - `予約者`: 予約された部屋名  
   - `Check In`: 予約開始日時  
   - `Check Out`: 予約終了日時
   - `Action`: 実行されたアクション (`ON` または `OFF`)  
   - `Timestamp`: 実行日時  

---

#### **🔹 `SPREADSHEET_ID` の取得手順**
1. **スプレッドシートを開く**
2. **ブラウザのアドレスバーの URL を確認**
"https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/edit"

3. **`d/` と `/edit` の間の文字列（XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX）が `SPREADSHEET_ID`**
4. **この `SPREADSHEET_ID` を `初期設定（機密）.gs` に設定**
```javascript
const INITIAL_CONFIG = {
    SPREADSHEET_ID: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // 取得したIDを設定
    SHEET_NAME: 'Logs'
};
```

---

### 📌 2.3 Google Apps Script（GAS）のセットアップ

#### **🔹 手順 1: Google スプレッドシートから GAS エディタを開く**

1. **Google スプレッドシートを開く**
   - [Google スプレッドシート](https://docs.google.com/spreadsheets/) にアクセスし、新しいスプレッドシートを作成するか、既存のスプレッドシートを開きます。

2. **GAS エディタを起動**
   - スプレッドシートのメニューから、`拡張機能` をクリックし、`Apps Script` を選択します。
   - これにより、GAS エディタが新しいタブで開きます。

   ![GAS エディタの起動](https://www.astina.co/wp-content/uploads/2021/06/1-2.png)

---

#### **🔹 手順 2: GitHub からコードを取得し、GAS エディタに貼り付ける**

1. **GitHub からコードをコピー**
   - 以下のリポジトリからコードを取得してください。  
     **[GitHub リポジトリ: yokamotp/switchbot_control](https://github.com/yokamotp/switchbot_control)**
   - リポジトリ内の必要なコードファイル（例: `main.gs`、`config.gs` など）を開き、コピーします。

2. **GAS エディタにコードを貼り付け**
   - GAS エディタで、デフォルトで作成されている `Code.gs` ファイルに、先ほどコピーしたコードを貼り付けます。
   - 必要に応じて、ファイル名を変更したり、新しいスクリプトファイルを作成して、適切にコードを配置してください。

3. **コードの保存**
   - すべてのコードを貼り付け、必要な設定を行ったら、GAS エディタの保存ボタンをクリックして、コードを保存します。

---

### 📌 2.4 `REMOTE_ID` の取得手順  

`REMOTE_ID` は、SwitchBotデバイスの仮想リモコンIDであり、GASを通じて取得することができます。以下の手順で `REMOTE_ID` を取得してください。  

#### **📌 手順**  

1. **`getDeviceInfo.gs` ファイルを開く**  
   - Google Apps Script (GAS) のエディタで `getDeviceInfo.gs` を開く  

2. **`getDeviceInfo()` 関数を実行**  
   - GASエディタの上部メニューから `実行` → `関数を選択` → `getDeviceInfo` を選択  
   - `▶ 実行` ボタンをクリックしてスクリプトを実行  

3. **ログを確認する**  
   - `表示` → `ログ` を開く  
   - 出力されたJSONデータの中から、該当するデバイスの `deviceId` を探す  

4. **取得した `deviceId` を `REMOTE_ID` に設定する**  
   - `deviceId` の値をコピーし、 `初期設定（機密）.gs` の `REMOTE_ID` に貼り付ける  

---

#### **📌 出力ログの例**

```json
{
  "statusCode": 100,
  "body": {
    "deviceList": [
      {
        "deviceId": "02-95480840",
        "deviceName": "エアコンリモコン",
        "deviceType": "Remote",
        "hubDeviceId": "000000000000"
      },
      {
        "deviceId": "03-12345678",
        "deviceName": "リビングライト",
        "deviceType": "Plug Mini (JP)",
        "hubDeviceId": "000000000000"
      }
    ]
  }
}
```

---

### 📌 2.5 `初期設定（機密）.gs` の編集

 `初期設定（機密）.gs` というファイルの内容をご自身の情報に更新してください。  
このファイルには **APIトークン、デバイスID、GoogleスプレッドシートのID** などの設定を記入します。

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
  DEVICE_POWER_CHECK_COMMAND: 'lowSpeed' // ON/OFF 判定用のコマンド（デバイスに応じて変更必要）
};

```

#### **🔹 手順 3: スクリプトの実行と権限の付与**

1. **スクリプトの実行**
   - GAS エディタの上部にある実行ボタン（▶️）をクリックして、スクリプトを実行します。

2. **権限の付与**
   - 初回実行時には、スクリプトが必要とする権限を付与するためのプロンプトが表示されます。
   - 画面の指示に従い、必要な権限を付与してください。

   ![権限の付与](https://www.astina.co/wp-content/uploads/2021/06/1-5.png)

   *画像引用元: [ASTINA メディア](https://www.astina.co/media/1137/)*

---

### 📌 2.5 Google Apps Script（GAS）のトリガー設定

Google カレンダーの予定を定期的に確認し、エアコンの ON/OFF を自動で制御するために、GAS の **トリガー実行** を設定します。

---

#### **🔹 手順 1: GAS エディタでトリガーを開く**
1. Google スプレッドシートを開く
2. メニューの `拡張機能` → `Apps Script` をクリックし、GAS エディタを開く
3. GAS エディタの左側メニューから `トリガー` を選択

---

#### **🔹 手順 2: 新しいトリガーを作成**
1. `+ トリガーを追加` ボタンをクリック
2. 以下の設定を入力
   - **実行する関数:** `checkCalendarForACControl`
   - **実行するデフォルトのデプロイ:** `Head`
   - **イベントのソース:** `時間主導型`
   - **時間ベースのトリガーのタイプ:** `分ベースのタイマー`
   - **時間の間隔:** `10分おき`（デバッグ時は `1分おき` を推奨）

3. `保存` をクリックしてトリガーを有効化

---

#### **🔹 手順 3: トリガーの動作確認**
1. `実行ログ` を確認し、エラーがないことをチェック
2. **カレンダーに予定を追加し、10分後に SwitchBot に反映されるか確認**
3. **デバッグ時はトリガー間隔を 1 分に設定し、短時間で動作確認**

---

✅ **この設定により、GAS が 10 分ごとに Google カレンダーをチェックし、エアコンを自動制御します。**  
🚀 **デバッグ時は 1 分ごとに設定し、正常に動作するか確認してください！**


---

### 📌 2.5 Googleカレンダーの設定
1. **Googleカレンダーに予約イベントを登録**
2. **説明欄に以下の形式で記述**
 CHECKIN: 2025-02-01 15:00:00 +0900 
 CHECKOUT: 2025-02-03 10:00:00 +0900 
 PROPERTY: 【067】グラシア上飯田#601
3. **GAS が予約情報を読み取り、30分前に自動でデバイスON**

---

## 📌 3. 動作の確認手順

---

## 📌 3.1 テスト環境の準備

本システムが正しく動作するか確認するために、Google Apps Script (GAS) 上でテストを実行し、SwitchBot デバイスの反応を確認します。

### **🔹 手順 1: Google スプレッドシートから GAS エディタを開く**
1. **Google スプレッドシートを開く**
   - [Google スプレッドシート](https://docs.google.com/spreadsheets/) にアクセスし、新しいスプレッドシートを作成するか、既存のスプレッドシートを開きます。

2. **GAS エディタを起動**
   - スプレッドシートのメニューから、`拡張機能` をクリックし、`Apps Script` を選択します。
   - これにより、GAS エディタが新しいタブで開きます。

3. **テストしたいファイルを開く**
   - 例えば、`testGetDeviceList()` をクリックし、**実行ボタン（▶️）** を押す  

4. **GAS のログ (`表示` → `実行ログ`) を確認**  
   - ✅ **成功:** `デバイス一覧` が表示される  
   - ❌ **失敗:** `API エラー` が表示される 

---
---

## 📌 3.2 テスト項目一覧

| **テスト名** | **内容** | **実行する関数** |
|-------------|----------|-----------------|
| **1. SwitchBot API 接続テスト** | SwitchBot API に接続し、登録済みのデバイス一覧を取得できるか確認 | `testGetDeviceList()` |
| **2. デバイスの ON テスト** | SwitchBot デバイスに `ON` コマンドを送信 | `testTurnOn()` |
| **3. デバイスの OFF テスト** | SwitchBot デバイスに `OFF` コマンドを送信 | `testTurnOff()` |
| **4. Googleカレンダーの読み取りテスト** | Google カレンダーから予約情報を取得 | `testReadCalendar()` |
| **5. GAS の予約に応じた制御テスト** | カレンダーの予定を基にデバイスを制御 | `checkCalendarForACControl()` |
| **6. スプレッドシートのログ確認** | ログに正しく記録されているか確認 | `testLogACAction()` |

---



