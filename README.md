# QR Code Generator

瀏覽器端產生 QR 碼的 Next.js 應用：多種內容模式、批次文字、本機歷史紀錄、中英介面與 sitemap/robots。

## 技術棧

| 項目 | 說明 |
|------|------|
| 框架 | Next.js 16（App Router、`app/[lng]`）、React 19 |
| 打包 | 開發/建置預設 `--turbopack` |
| UI | HeroUI v3、Tailwind CSS v4、`next-themes` |
| i18n | `i18next` + `react-i18next`；語系：`en`、`zh-Hant`；路徑前綴由 `proxy.ts` 處理 |
| QR | `qrcode`（`toDataURL`） |
| 歷史 | IndexedDB（`lib/qr-history-db.ts`，上限 1000 筆） |
| 品質 | Biome（lint / format） |
| SEO | `next-sitemap`（`postbuild` 產生 sitemap、robots） |

## 功能摘要

- **模式**：純文字、URL、Wi‑Fi（`WIFI:`）、Email（`mailto:`）、電話（`tel:`）、簡訊（`sms:`）
- **文字批次**：多行輸入，單次最多 50 個非空行各自產一張預覽
- **歷史**：寫入 / 還原表單 / 刪除單筆 / 清空；資料僅存在使用者瀏覽器
- **PWA**：`ServiceWorkerRegister` + `public/sw.js`；`next.config.ts` 對 `sw.js` 設 `Service-Worker-Allowed: /`

## 需求

- **Node.js**：建議 20+（與 Next 16 官方建議對齊）

## 指令

專案根目錄有 `package-lock.json`，以 **npm** 為例：

```bash
npm install
npm run dev      # http://localhost:3000，會依語系 redirect 到 /en 或 /zh-Hant
npm run build    # 結束後 postbuild 跑 next-sitemap
npm run start
npm run lint     # biome check
npm run lint:fix
npm run format   # biome format --write
```

`package.json` 內另有 `bump-deps`（使用 `pnpm install`）；若你只用 npm，請自行改對應流程。

## 環境變數

| 變數 | 用途 |
|------|------|
| `SITE_URL` | `next-sitemap` 的 `siteUrl`；未設時預設為 `https://util.apisrv.space`（見 `next-sitemap.config.js`） |

部署到自訂網域時請設好 `SITE_URL`，避免 sitemap 內網址錯誤。

## 目錄一覽（精簡）

- `app/[lng]/` — 語系路由、首頁與元件（`GeneratorCard`、`QrModeFields`、`QrHistoryPanel` 等）
- `app/i18n/` — 設定、client/server 翻譯初始化、`locales/*/translation.json`
- `lib/qr-payload.ts` — 各模式 payload 組裝與欄位型別
- `lib/heroui.tsx` — HeroUI 與主題 Provider
- `proxy.ts` — 語系偵測、路徑補上 `/{lng}`、`x-i18next-current-language` header

## 授權

見專案根目錄 `LICENSE`。
