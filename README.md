# 規格驅動開發營運系統（Spec-Driven DevOp）

以「規格為先」的老虎機引擎與視覺化管理系統：具可重現的隨機數（Seeded RNG）、規格驗證、模擬統計、AI 最佳化器，以及樹狀圖與心智圖管理功能。

## 🎯 核心功能

### 🎰 老虎機引擎
- 以 Zod 定義 Slot 規格，並可輸出 JSON Schema
- 可重現的 Seeded RNG
- 線（Line）與散佈（Scatter）評分，預設 5x3 版面
- 模擬器：RTP、波動度（Volatility）、命中率（Hit Rate）
- 啟發式最佳化器，用於逼近目標 RTP／波動度
- CLI 指令：validate、spin、simulate、optimize

### 🌲 樹狀圖系統
- **位置約束**：根節點強制位於最左上角
- **智能布局**：防止子節點越過根節點上方或左方
- **多欄位編輯**：支援 10+ 個專業屬性欄位編輯
- **視覺層級**：根節點特殊樣式與 z-index 優先級
- **動態展開**：節點收合時布局約束自動生效

### 🧠 心智圖管理
- 節點樣式自定義與編輯功能
- 連接線優化與自動布局
- 資料持久化與歷史記錄
- 互動式導覽與操作介面

### 🛠 開發工具
- 測試（Jest）、程式碼品質（ESLint + Prettier）
- 熱重載開發環境（Vite + React）
- TypeScript 型別安全
- 模組化架構設計

## 快速開始（Quick Start）

安裝相依套件並執行測試／建置。

開發循環（Dev cycle）：
- Lint：npm run lint
- Build：npm run build
- Test：npm test
- CLI 說明：npm run cli -- --help

VS Code 工作任務（Tasks）：
- 執行模擬任務：Terminal → Run Task → slot:simulate

### 指令列（CLI）

- 驗證規格：`npm run cli -- validate -s src/specs/examples/basic-slot.json`
- 單次旋轉：`npm run cli -- spin -s src/specs/examples/basic-slot.json --seed demo`
- 批次模擬：`npm run cli -- simulate -s src/specs/examples/basic-slot.json --seed demo --spins 5000`
- 最佳化：`npm run cli -- optimize -s src/specs/examples/basic-slot.json --targetRTP 0.95 --spins 2000 --iters 20`

## 程式介面（Programmatic API）

從 `src/index.ts` 匯入：

- `validateSpec(obj)`：驗證規格物件
- `createEngine(spec, seed)` → `{ spin(): SpinResult }`：建立引擎並執行單次旋轉
- `simulate(spec, { seed, spins })`：執行多次模擬，回傳統計指標
- `optimize(spec, { seed, spins, iterations, targetRTP, targetVol, lambda })`：啟發式最佳化

## 規格設計備註（Spec Design Notes）

- 保持輪帶（strip）平衡以設定基礎 RTP；透過調整賠付表（paytable）塑造派彩曲線
- 使用 Wild 平滑線上命中；以 Scatter 提供線外觸發的刺激性事件
- 最佳化器僅交換輪帶內符號位置，以維持結果可重現性

授權條款：MIT
