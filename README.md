# Copy Board — 常用語收藏

簡介
---
Copy Board 是一個小型前端工具，把常用文字片段存在瀏覽器 localStorage，方便隨時複製、編輯、匯入/匯出 JSON 備份。

功能
---
- 新增、編輯（Modal）、刪除項目
- 複製到剪貼簿（Clipboard API）
- 搜尋（文字與標籤）
- 匯出 JSON、匯入 JSON（匯入會 prepend 到現有列表）
- 清除所有
- 項目存在 localStorage（key: `copyBoard.items`）

使用說明
---
1. 把三個檔案放同一個資料夾：`index.html`、`app.js`、`style.css`，然後在瀏覽器開啟 `index.html`。
2. 按「新增」新增新條目，標籤用逗號分隔。
3. 按「修改」可在彈窗編輯內容與標籤，按「儲存變更」後會更新並存回 localStorage。
4. 按「複製」會把內容放到剪貼簿並短暫變色提示。
5. 匯出會產生 JSON 檔案，匯入接受陣列格式的 JSON。範例：
```json
[
  {"id":"abc","text":"範例文字","tags":["a","b"],"createdAt":"2025-01-01T00:00:00Z"}
]
```
6. 搜尋框會同時在內容與標籤中匹配。

備註與建議
---
- 若想把匯入改為覆蓋而非 prepend，可在 `app.js` 的 import 部分調整 `items = sanitized.concat(items);` 為 `items = sanitized;`。
- 若希望使用 modal 以外的 inline 編輯，也可以改用 `enterEditMode` 的方式。
- 若要同步到雲端或跨裝置，需加後端 API 或同步到 GitHub Gist / Dropbox 等服務。

授權
---
你可以自由修改、重用這個程式碼。
