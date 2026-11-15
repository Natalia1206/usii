# usii

 https://usii.pages.dev/ 的網站檔案（順昶塑膠 SPC / STC 請款明細產生器）。

## 資料夾說明

- `site/`：從線上網站下載的完整檔案（`index.html` 與 `assets/`）。這是 Vite 編譯後的版本，可直接部署到 Cloudflare Pages（建置輸出目錄設為 `site`，不需要建置指令）。
- `readable/app.js`：主程式中屬於這個 App 本身的部分（不含 React、jsPDF 等函式庫），已用 Prettier 排版方便閱讀。變數名稱是編譯後的短名稱，原始的 TypeScript / JSX 原始碼無法從線上網站還原。
- `readable/styles.css`：排版後的樣式表。

## 注意

- 網站的圖片辨識功能會呼叫 `/api/extract`（Cloudflare Pages Function，在伺服器端執行，可能使用 Gemini API 金鑰）。伺服器端程式碼不會傳到瀏覽器，因此不在這裡；若要重新部署完整功能，需要從 Google AI Studio 或 Cloudflare 專案取回原始碼，或重新撰寫該 API。
- 原始專案若是在 Google AI Studio 建立，可以在 AI Studio 中使用「Download / Export to GitHub」取得完整原始碼。
