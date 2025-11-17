```markdown
# Copy Board

一個簡單的「常用語收藏」單頁應用，支援新增 / 刪除 / 搜尋 / 複製，資料儲存在瀏覽器 localStorage，並支援匯出與匯入 JSON 做備份。

使用方式
1. 把 index.html、app.js、style.css 放到 repo 根目錄（或 GitHub Pages 的分支）。
2. 開啟 index.html（或啟用 GitHub Pages 發佈後透過網頁存取）。
3. 在「新增常用語」輸入框貼上文字，按「新增」或 Ctrl/Cmd+Enter 即可。
4. 點「複製」把文字放到剪貼簿；點「刪除」移除項目；上方搜尋框可即時過濾。
5. 可用「匯出 JSON」下載備份；用「匯入 JSON」把備份匯回（匯入會合併到現有項目最前）。

部署到 GitHub Pages（簡單步驟）
1. 將檔案 commit & push 到 main 或 gh-pages 分支。
2. 在 GitHub Repo 設定 -> Pages，選擇 branch（main 或 gh-pages），按 Save。
3. 幾分鐘後即可在提供的網站 URL 使用。

自訂與延伸建議
- 想要多人同步使用可加入簡單後端（例如 Node + SQLite 或 Firebase）來儲存。
- 可加上編輯功能、排序（最常用、最近使用）或標籤篩選 UI。
```
