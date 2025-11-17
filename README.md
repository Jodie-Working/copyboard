# Copy Board — 常用語收藏

簡介
---
Copy Board 是一個小型前端工具，把常用文字片段存在瀏覽器 localStorage，方便隨時複製、編輯、匯入/匯出 JSON 備份。

新增功能：收藏 (favorite)
---
- 每個條目可以按「星號」收藏（或取消收藏）。
- 收藏狀態會存於 localStorage（項目欄位 favorite: true/false）。
- 畫面會把已收藏的條目顯示在最前面（便於快速取用）。
- 匯出 / 匯入會包含 favorite 屬性。

功能總覽
---
- 新增、編輯（Modal）、刪除項目
- 收藏 / 取消收藏（小星號）
- 複製到剪貼簿（Clipboard API）
- 搜尋（文字與標籤）
- 匯出 JSON、匯入 JSON（匯入會 prepend 到現有列表）
- 清除所有
- 項目存在 localStorage（key: `copyBoard.items`）

使用說明
---
1. 把檔案放同一個資料夾：`index.html`、`app.js`、`style.css`，然後在瀏覽器開啟 `index.html`。
2. 按「新增」新增新條目，標籤用逗號分隔。
3. 按每個卡片的星號標記收藏，收藏的項目會自動排到列表上方。
4. 按「修改」可在彈窗編輯內容與標籤，按「儲存變更」後會更新並存回 localStorage。
5. 按「複製」會把內容放到剪貼簿並短暫變色提示。
6. 匯出會產生 JSON 檔案，匯入接受陣列格式的 JSON，並保留 favorite 欄位。

範例匯入 JSON
```json
[
  {"id":"abc","text":"範例文字","tags":["a","b"],"favorite":true,"createdAt":"2025-01-01T00:00:00Z"}
]
```

授權
---
你可以自由修改、重用這個程式碼。
