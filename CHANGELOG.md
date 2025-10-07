# 變更日誌（Changelog）

本檔案記錄專案中所有重要的變更，遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 規範。

版本號遵循 [語意化版本 2.0.0](https://semver.org/lang/zh-TW/)。

---

## [Unreleased]

### 新增（Added）

- 無
### 修復（Fixed）

- 無

---


### 新增（Added）
- ✨ 初始專案結構與 CLI 工具
- 📝 完整開發計劃文檔
  - `docs/SDD-開發方案計劃書.md`（基礎 SDD 方案）
  - `docs/SDD+AI-開發方案計劃書.md`（含 AI Agent 完整計劃）
  - `docs/SDD+AI-完整開發計劃-範例與排程.md`（精簡版）
  - `docs/AI-Agent-任務待辦清單-範例遊戲.md`（任務清單範例）
- 🎰 基礎 Slot 引擎實作
  - RNG（可設定 seed，確定性）
  - Reel Spin 邏輯
  - Payout 計算
  - `validate`：規格驗證
  - `spin`：單次旋轉
  - `simulate`：批量模擬（RTP/HitRate/Volatility）
  - `optimize`：啟發式優化（接近目標 RTP/Vol）
  - Schema 驗證測試
  - 引擎確定性測試
- 🔄 CI/CD Pipeline
  - `.github/PULL_REQUEST_TEMPLATE.md`：PR 模板
- 📋 專案管理文檔
  - `request.md`：請求與結果紀錄（append-only）
  - `README.md`：繁體中文使用說明

### 變更（Changed）
- 🌐 CLI 訊息全面繁體中文化
- 🌐 Zod 錯誤訊息繁體中文化

### 技術規格
- **語言**：TypeScript 5.x
- **測試框架**：Jest
- **驗證**：Zod
- **CLI**：Commander.js
- **RNG**：seedrandom（確定性）

---

## 版本標籤說明

- **[Unreleased]**：尚未發布的變更
- **[1.0.0]**：首個正式版本

## 變更類型說明

- **新增（Added）**：新功能、新檔案、新文檔
- **變更（Changed）**：既有功能的變更、重構
- **修復（Fixed）**：Bug 修復
- **移除（Removed）**：移除的功能或檔案
- **安全性（Security）**：安全性相關的修復

---

**維護規則**：
1. 每次規格變更（影響 RTP/Vol）必須記錄於此
2. 重大功能新增需標註版本號
3. 發佈前將 `[Unreleased]` 改為版本號與日期
4. 遵循語意化版本（MAJOR.MINOR.PATCH）
