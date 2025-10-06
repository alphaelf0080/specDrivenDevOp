# Vite + TypeScript 前後端開發框架

## 專案結構

```
specDrivenDevOp/
├── client/                 # 前端代碼（React + Vite）
│   ├── App.tsx            # 主要應用元件
│   ├── App.css            # 應用樣式
│   ├── main.tsx           # 前端入口
│   └── index.css          # 全域樣式
├── server/                 # 後端代碼（Express）
│   └── index.ts           # 後端伺服器入口
├── src/                    # 共用代碼（引擎、CLI 等）
│   ├── engine/            # 遊戲引擎
│   ├── cli/               # CLI 工具
│   └── specs/             # 規格定義
├── docs/                   # 文檔
├── tests/                  # 測試
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置（主）
├── tsconfig.client.json   # TypeScript 配置（前端）
├── tsconfig.server.json   # TypeScript 配置（後端）
├── index.html             # HTML 入口
└── package.json           # 專案配置
```

## 技術棧

### 前端
- ⚡ **Vite** - 極速開發伺服器與建置工具
- ⚛️ **React 18** - UI 框架
- 🔷 **TypeScript** - 型別安全
- 🎨 **CSS3** - 樣式（支援 CSS Modules）

### 後端
- 🚂 **Express** - Node.js Web 框架
- 🔷 **TypeScript** - 型別安全
- 🛡️ **Helmet** - 安全性標頭
- 🌐 **CORS** - 跨域資源共享
- 📝 **Morgan** - HTTP 請求日誌

### 開發工具
- 🔧 **tsx** - TypeScript 執行器（取代 ts-node）
- 🔄 **concurrently** - 並行執行腳本
- 📦 **ESLint + Prettier** - 代碼品質與格式化

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

複製環境變數範例檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，調整配置：

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

### 3. 啟動開發伺服器

#### 方式 1：同時啟動前後端（推薦）

```bash
npm run dev
```

這會同時啟動：
- 前端：http://localhost:3000
- 後端：http://localhost:3001

#### 方式 2：分別啟動

**終端機 1 - 啟動後端：**
```bash
npm run dev:server
```

**終端機 2 - 啟動前端：**
```bash
npm run dev:client
```

### 4. 開啟瀏覽器

前端會自動開啟瀏覽器，訪問：http://localhost:3000

## 可用指令

### 開發
```bash
npm run dev              # 同時啟動前後端開發伺服器
npm run dev:server       # 僅啟動後端伺服器
npm run dev:client       # 僅啟動前端伺服器
```

### 建置
```bash
npm run build            # 建置前後端（生產環境）
npm run build:server     # 建置後端
npm run build:client     # 建置前端
```

### 預覽（生產環境）
```bash
npm run preview          # 預覽前端建置結果
```

### 測試與品質
```bash
npm test                 # 執行測試
npm run lint             # ESLint 檢查
npm run format           # Prettier 格式化
```

### CLI 工具
```bash
npm run cli -- validate -s <spec-file>     # 驗證規格
npm run cli -- simulate -s <spec-file>     # 模擬測試
npm run cli -- spin -s <spec-file>         # 單次旋轉
```

## API 端點

### 健康檢查
```bash
GET /api/health
```

回應範例：
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### 旋轉
```bash
POST /api/spin
Content-Type: application/json

{
  "bet": 1,
  "seed": "optional-seed"
}
```

### 驗證規格
```bash
POST /api/validate
Content-Type: application/json

{
  "spec": { ... }
}
```

### 模擬測試
```bash
POST /api/simulate
Content-Type: application/json

{
  "spec": { ... },
  "spins": 10000,
  "seed": "optional-seed"
}
```

## 前端開發

### 新增頁面

1. 在 `client/` 目錄下建立新元件：

```tsx
// client/NewPage.tsx
import { useState } from 'react';

export default function NewPage() {
  return (
    <div>
      <h1>新頁面</h1>
    </div>
  );
}
```

2. 在 `App.tsx` 中引入使用。

### API 呼叫

使用 `fetch` API 呼叫後端：

```tsx
const response = await fetch('/api/spin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ bet: 1 }),
});
const data = await response.json();
```

Vite 會自動代理 `/api` 請求到後端（配置在 `vite.config.ts`）。

## 後端開發

### 新增 API 端點

在 `server/index.ts` 中新增路由：

```typescript
app.post('/api/new-endpoint', async (req: Request, res: Response) => {
  try {
    const { param } = req.body;
    
    // 處理邏輯
    const result = await someFunction(param);
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
```

### 整合遊戲引擎

引用 `src/engine/` 中的模組：

```typescript
import { SlotEngine } from '../src/engine/slotEngine.js';

app.post('/api/spin', async (req: Request, res: Response) => {
  const engine = new SlotEngine(spec);
  const result = engine.spin({ seed: req.body.seed });
  res.json(result);
});
```

## 部署

### 建置生產版本

```bash
npm run build
```

會產生：
- `dist/client/` - 前端靜態檔案
- `dist/server/` - 後端編譯後的 JS

### 部署到伺服器

1. **前端（靜態網站託管）**
   - 將 `dist/client/` 上傳到 Vercel / Netlify / S3 等
   - 或使用 Nginx / Apache 提供靜態檔案

2. **後端（Node.js 伺服器）**
   - 將專案上傳到伺服器
   - 設定環境變數（`.env`）
   - 啟動：`node dist/server/index.js`
   - 建議使用 PM2 或 Docker 管理

### Docker 部署（選配）

建立 `Dockerfile`：

```dockerfile
# 多階段建置
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生產階段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/server/index.js"]
```

## 常見問題

### Q: 前端無法連接後端？
**A:** 檢查：
1. 後端是否在 `http://localhost:3001` 運行
2. `vite.config.ts` 中的 proxy 配置是否正確
3. 瀏覽器控制台是否有 CORS 錯誤

### Q: TypeScript 編譯錯誤？
**A:** 執行 `npm install` 確保所有型別定義安裝完整。

### Q: 熱更新不工作？
**A:** 
- 前端：Vite 自帶 HMR，儲存即更新
- 後端：使用 `tsx watch` 自動重啟

### Q: 如何切換到 Vue？
**A:** 
1. 安裝 Vue：`npm install vue`
2. 修改 `vite.config.ts`：使用 `@vitejs/plugin-vue`
3. 修改 `client/` 中的元件為 `.vue` 檔案

## 相關文檔

- 📖 [Vite 文檔](https://vitejs.dev/)
- 📖 [React 文檔](https://react.dev/)
- 📖 [Express 文檔](https://expressjs.com/)
- 📖 [TypeScript 文檔](https://www.typescriptlang.org/)
- 📖 [SDD 開發計劃](./docs/SDD+AI-開發方案計劃書.md)
- 📖 [實戰落地指南](./docs/SDD+AI-實戰落地優化分析.md)

## 授權

MIT License

---

**開發團隊**：Slot Game Development Team  
**最後更新**：2025-10-06
