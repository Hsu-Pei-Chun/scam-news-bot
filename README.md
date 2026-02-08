# Scam News Bot

每天自動推送最新詐騙相關 YouTube 影片到指定 LINE 群組的 Bot。

## 功能

- 使用 YouTube Data API 搜尋「詐騙新聞」關鍵字
- 取得最新上傳的影片標題和連結
- 透過 LINE Push Message API 發送到指定群組
- 使用 GitHub Actions 每天台灣時間早上 9:00 自動執行

## 環境變數

在 GitHub Repository Settings > Secrets and variables > Actions 中設定以下 Secrets：

| 變數名稱 | 說明 |
|---------|------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 金鑰 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API Channel Access Token |
| `LINE_GROUP_ID` | 目標 LINE 群組的 ID |

---

## 如何取得 YouTube API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)

2. 建立新專案或選擇現有專案

3. 啟用 YouTube Data API v3：
   - 在左側選單點擊「API 和服務」>「程式庫」
   - 搜尋「YouTube Data API v3」
   - 點擊「啟用」

4. 建立 API 金鑰：
   - 在左側選單點擊「API 和服務」>「憑證」
   - 點擊「建立憑證」>「API 金鑰」
   - 複製產生的 API 金鑰

5. （建議）限制 API 金鑰：
   - 點擊剛建立的 API 金鑰進行編輯
   - 在「API 限制」中選擇「限制金鑰」
   - 只選擇「YouTube Data API v3」

---

## 如何建立 LINE Bot 並取得 Channel Access Token

> **注意**：LINE 已更改流程，現在無法直接從 LINE Developers Console 建立 Messaging API Channel。
> 必須先建立 LINE Official Account，再啟用 Messaging API。

### 步驟一：建立 LINE Official Account

1. 前往 [LINE Official Account 註冊頁面](https://entry.line.biz/form/entry/unverified)

3. 使用 LINE 帳號登入（或註冊新帳號）

4. 填寫帳號資訊：
   - 帳號名稱（Bot 名稱）
   - 公司/店家名稱
   - 業種類別
   - 其他必要資訊

5. 完成建立後，進入 LINE Official Account Manager 管理後台

### 步驟二：啟用 Messaging API

1. 在 LINE Official Account Manager 中，點擊右上角「設定」

2. 在左側選單找到「Messaging API」

3. 點擊「啟用 Messaging API」

4. 選擇或建立一個 Provider：
   - 如果沒有 Provider，需要輸入 Provider 名稱來建立
   - Provider 是在 LINE Developers Console 中管理 Channel 的容器

5. 確認後完成啟用

### 步驟三：取得 Channel Access Token

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)

2. 登入後，選擇剛才建立的 Provider

3. 點擊剛才啟用 Messaging API 的 Channel

4. 點擊「Messaging API」標籤

5. 滾動到最下方找到「Channel access token」

6. 點擊「Issue」產生 Long-lived channel access token

7. 複製此 Token

### 步驟四：設定 Bot 行為（可選）

在 LINE Official Account Manager 中：
- 關閉「自動回應訊息」
- 關閉「加入好友的歡迎訊息」

或在 LINE Developers Console 的 Messaging API 標籤中：
- 將「Auto-reply messages」設為「Disabled」
- 將「Greeting messages」設為「Disabled」

---

## 如何取得群組的 Group ID

1. 前往 [Webhook.site](https://webhook.site/)，複製頁面上的 URL
2. 到 LINE Developers Console > Messaging API 標籤，將該 URL 填入「Webhook URL」並開啟「Use webhook」
3. 把 Bot 加入群組，在群組中發送任意訊息
4. 回到 Webhook.site 查看請求內容，找到 `source.groupId` 即為 Group ID

---

## 本地開發

### 安裝依賴

```bash
yarn install
```

### 設定環境變數

複製 `.env.example` 並填入實際值：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入你的 API 金鑰：

```bash
YOUTUBE_API_KEY=your_youtube_api_key
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_GROUP_ID=your_group_id
```

> `.env` 檔案已被加入 `.gitignore`，不會被 commit。

### 執行 Bot

```bash
yarn dev
```

程式會自動載入 `.env` 檔案中的環境變數。

### 其他指令

```bash
# ESLint 檢查
yarn lint

# ESLint 自動修復
yarn lint:fix

# Prettier 格式化
yarn format

# 檢查格式
yarn format:check
```

---

## GitHub Actions

此專案使用 GitHub Actions 進行每日自動推送：

- **排程時間**：每天 UTC 01:00（台灣時間 09:00）
- **手動觸發**：可在 Actions 頁面手動執行

### 手動觸發測試

1. 前往 GitHub Repository 的 Actions 頁面
2. 點擊「Daily Scam News Push」workflow
3. 點擊「Run workflow」按鈕

---

## 專案結構

```
scam-news-bot/
├── .github/
│   └── workflows/
│       └── daily-push.yml    # GitHub Actions 設定
├── .husky/
│   └── pre-commit            # Git pre-commit hook
├── src/
│   └── index.js              # 主程式
├── .env                      # 環境變數（不會 commit）
├── .env.example              # 環境變數範本
├── .gitignore                # Git 忽略清單
├── .prettierrc               # Prettier 設定
├── eslint.config.js          # ESLint 設定
├── package.json              # 專案設定
├── yarn.lock                 # 依賴鎖定檔
└── README.md                 # 說明文件
```

---

## 注意事項

1. **YouTube API 配額**：YouTube Data API 有每日配額限制（預設 10,000 單位），每次搜尋消耗約 100 單位，每天執行一次完全足夠

2. **LINE Push Message 限制**：免費方案每月有 500 則推送訊息限制，每天發送一則完全足夠

3. **GitHub Actions 時間**：GitHub Actions 的 cron 排程可能會有幾分鐘的延遲，這是正常現象

---

## License

MIT
