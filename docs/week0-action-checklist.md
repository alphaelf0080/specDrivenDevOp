# Week 0 立即行動清單

## 文件資訊
- **目標**：完成前置工作，為 Week 1 正式開發做好準備
- **期限**：5-7 個工作日
- **負責人**：全體團隊
- **更新日期**：2025-10-06

---

## ✅ Day 0（今天，2-3 小時）

### 企劃（Product Owner）
- [ ] **召開 Kickoff 會議**（30 分鐘）
  - 凍結目標：Base Game、5x3、RTP=95%、Vol=Medium (25-35)、MaxWin=5000x
  - 定義不做項目：No Bonus、No Free Game、No Progressive Jackpot
  - 確認 8 週排程可行性
  - 分配角色與職責
  - **輸出**：會議紀錄 `docs/kickoff-notes.md`

- [ ] **建立風險登記簿**
  - 使用 Google Sheets 或 Notion
  - 初始風險項：規格變更頻繁、資產延期、RTP 偏差、測試覆蓋不足
  - 每項風險標註：機率（低/中/高）、影響（低/中/高）、緩解措施
  - **輸出**：風險登記簿連結

### 數值（Math Designer）
- [ ] **建立規格 v0.1**
  - 複製範例：`cp src/specs/examples/basic-slot.json src/specs/games/<project-name>.json`
  - 調整符號清單（依題材）
  - 調整 reels（輪帶密度）
  - 調整 paytable（初版賠率）
  - **輸出**：`src/specs/games/<project-name>.json`

- [ ] **執行基線模擬**
  ```bash
  npm run cli -- validate -s src/specs/games/<project-name>.json
  npm run cli -- simulate -s src/specs/games/<project-name>.json --spins 10000 --seed baseline-$(date +%s)
  ```
  - 記錄結果：RTP、HitRate、Volatility、MaxWin
  - **輸出**：`docs/baselines/week0-baseline.json`

### 測試（QA Engineer）
- [ ] **建立 PR 模板**
  - 已提供：`.github/PULL_REQUEST_TEMPLATE.md`
  - Review 並確認欄位符合需求
  - **輸出**：PR 模板就緒

- [ ] **寫第一個確定性測試**
  ```typescript
  // tests/deterministic.test.ts
  it('同 seed 應產生相同結果', () => {
    const result1 = spin(spec, { seed: 'test123' });
    const result2 = spin(spec, { seed: 'test123' });
    expect(result1).toEqual(result2);
  });
  ```
  - **輸出**：測試檔案就緒

### 美術（Art Designer）
- [ ] **確認資產命名規範**
  - 閱讀 `docs/asset-naming-guide.md`
  - 確認理解命名規則（bg_/sym_/btn_/tx_ 等）
  - **輸出**：確認清單

- [ ] **建立 manifest 骨架**
  ```bash
  mkdir -p assets/{bg,symbols,buttons,text,icons,numbers,effects,lines,audio}
  touch assets/manifest.json
  ```
  - **輸出**：目錄結構就緒

### 前端/後端（Developers）
- [ ] **Review 現有代碼**
  - 理解 CLI 工具流程（validate/simulate/optimize）
  - 理解 Schema 定義（`src/specs/slot.schema.ts`）
  - 理解引擎核心（`src/engine/`）
  - **輸出**：理解報告（口頭或筆記）

- [ ] **建立開發分支**
  ```bash
  git checkout -b feat/week0-setup
  ```

---

## 📅 Day 1-2（第一階段，1 天）

### 全員
- [ ] **定義 DoD（Definition of Done）**
  - 建立文檔：`docs/definition-of-done.md`
  - 內容包含：
    - 數學品質：RTP 偏差 ≤ 1%、100k+ spins 模擬通過
    - 效能：首屏 < 2s、FPS ≥ 60、API p95 < 100ms
    - 測試：覆蓋率 ≥ 80%、E2E 綠燈率 ≥ 95%
    - 代碼：Lint 通過、Typecheck 通過、無 TODO 註解
  - **輸出**：DoD 文檔

### 企劃
- [ ] **建立任務看板**
  - 使用 Jira / GitHub Projects / Trello
  - 建立泳道：Spec / Engine / FE / BE / Asset / QA / Docs
  - 建立標籤：P0-Critical / P1-High / P2-Medium / P3-Low
  - 初始 Sprint 0 卡片（約 15-20 張）
  - **輸出**：看板連結

### 數值
- [ ] **規格 v0.1 精煉**
  - 跑 100k 模擬（增加樣本）
  ```bash
  npm run cli -- simulate -s src/specs/games/<project-name>.json --spins 100000 --seed week0-v01
  ```
  - 若 RTP 偏差 > 5%，調整 paytable
  - **輸出**：規格 v0.1 Final

- [ ] **建立數學文檔骨架**
  - 建立 `docs/math/<project-name>-PAR-sheet.md`
  - 初版內容：符號清單、輪帶密度、賠付表、目標 RTP/Vol
  - **輸出**：PAR Sheet 草稿

### 測試
- [ ] **擴充確定性測試套件**
  - 增加至少 5 個測試案例：
    - 邊界條件（全 Wild、全 Scatter）
    - 極值測試（最大贏分、最小贏分）
    - 空結果測試（無中獎）
  - **輸出**：測試套件擴充

### 美術
- [ ] **建立 PSD 範本**
  - 依規格符號清單建立圖層
  - 至少完成 3 個符號（A/K/Q）+ 1 個按鈕（spin 四態）
  - 確保命名符合規範（`sym_A_normal.png` 等）
  - **輸出**：PSD 範本檔案 `design/<project-name>-template.psd`

---

## 📅 Day 3-4（第二階段，1 天）

### 企劃
- [ ] **週會排程建立**
  - 定義會議節奏：
    - 每日站會：09:30（15 分鐘）
    - 每週需求細化：週一 10:00（30 分鐘）
    - 每週風險檢視：週三 14:00（15 分鐘）
    - 每週檢查點評審：週五 16:00（30 分鐘）
  - 建立 Google Calendar 邀請
  - **輸出**：會議排程確認

### 數值
- [ ] **嘗試優化器**
  ```bash
  npm run cli -- optimize -s src/specs/games/<project-name>.json \
    --targetRTP 0.95 --targetVol 30 --spins 5000 --iters 50
  ```
  - 檢視候選規格
  - 評估是否採用建議
  - **輸出**：優化報告 `docs/optimization/week0-opt-report.txt`

### 測試
- [ ] **建立 CI Pipeline 骨架**
  - 已提供：`.github/workflows/ci.yml`
  - 確認 GitHub Actions 已啟用
  - 提交測試 PR 驗證流程
  - **輸出**：CI Pipeline 運行成功

### 後端
- [ ] **建立 Spin API 骨架**
  - 建立 `src/api/spin.ts`
  - 定義 API 契約（OpenAPI spec 草稿）
  ```typescript
  // POST /api/spin
  // Request: { bet: number, seed?: string }
  // Response: { grid: string[][], wins: Win[], totalWin: number }
  ```
  - **輸出**：API 骨架代碼

### 前端
- [ ] **建立規格解析器**
  - 建立 `src/fe/spec-loader.ts`
  - 讀取 spec.json 並解析為前端可用格式
  - 測試載入範例規格
  - **輸出**：規格載入器就緒

### 美術
- [ ] **完成符號資產（初版）**
  - 完成至少 6 個符號（A/K/Q/J/10/9）
  - 每個符號至少 `normal` 狀態
  - 執行切圖（手動或自動）
  - 壓縮檔案（pngquant）
  - **輸出**：初版符號資產包

---

## 📅 Day 5（第三階段，半天）

### 全員
- [ ] **Week 0 檢查點會議**（1 小時）
  - 檢視所有交付物
  - 確認 DoD 達成情況
  - 識別阻礙與風險
  - 決定 Week 1 優先級
  - **輸出**：檢查點會議紀錄

### 數值
- [ ] **規格 v0.1 凍結**
  - 標記 Git Tag：`git tag spec-v0.1.0`
  - 推送：`git push origin spec-v0.1.0`
  - 產出模擬報告存檔
  - **輸出**：規格 v0.1 正式版

### 測試
- [ ] **Week 0 測試報告**
  - 執行完整測試：`npm test -- --coverage`
  - 產出覆蓋率報告
  - 記錄基線指標（測試數量、通過率、覆蓋率）
  - **輸出**：`reports/week0-test-report.md`

### 美術
- [ ] **執行資產檢核**
  ```bash
  node scripts/check-assets.js --spec src/specs/games/<project-name>.json --assets assets/
  ```
  - 檢視缺漏報告
  - 標記 Week 1 待補充項目
  - **輸出**：資產檢核報告

### 前端/後端
- [ ] **整合測試（初步）**
  - 後端 Spin API Mock 返回固定結果
  - 前端呼叫 Mock API 並渲染
  - 驗證端到端流程可行
  - **輸出**：整合 Demo（內部）

---

## 📊 Week 0 交付物檢查清單

### 必需交付物（P0）
- [ ] ✅ 目標凍結文檔（`docs/kickoff-notes.md`）
- [ ] ✅ DoD 定義文檔（`docs/definition-of-done.md`）
- [ ] ✅ 規格 v0.1 + 基線模擬報告（`src/specs/games/<project-name>.json` + `docs/baselines/week0-baseline.json`）
- [ ] ✅ CI Pipeline 運行成功（至少 Lint + Validate）
- [ ] ✅ PR 模板啟用（`.github/PULL_REQUEST_TEMPLATE.md`）
- [ ] ✅ 風險登記簿建立
- [ ] ✅ 任務看板建立（Sprint 1 卡片 Ready）
- [ ] ✅ 確定性測試套件（≥ 5 cases）

### 建議交付物（P1）
- [ ] 🟡 資產命名規範確認
- [ ] 🟡 PSD 範本（3 符號 + 1 按鈕）
- [ ] 🟡 資產 manifest 骨架
- [ ] 🟡 Spin API 骨架
- [ ] 🟡 規格解析器（前端）
- [ ] 🟡 優化報告（初步嘗試）

### 選配交付物（P2）
- [ ] ⚪ 初版符號資產包（6 符號 normal）
- [ ] ⚪ PAR Sheet 草稿
- [ ] ⚪ 整合 Demo（Mock API + FE）

---

## 🚨 阻礙處理流程

### 遇到阻礙時
1. **立即標記**：在任務看板標記 `Blocked`
2. **記錄原因**：在卡片註解記錄阻礙原因
3. **通知相關人**：在站會或 Slack 通知
4. **尋求協助**：Tech Lead 或 PM 介入協調
5. **記錄到風險簿**：若為重複性問題

### 常見阻礙與解法
| 阻礙 | 解法 |
|-----|-----|
| **規格不確定** | 與企劃/數值開會，30 分鐘內決策 |
| **工具不熟悉** | 配對編程（Pair Programming） |
| **依賴未就緒** | 使用 Mock 或佔位符先行 |
| **技術難題** | Tech Spike（限時 2 小時研究） |

---

## 📈 成功標準（Week 0 Exit Criteria）

### 必須達成（Go 條件）
- ✅ 規格 v0.1 通過 100k 模擬，RTP 在 ±5% 範圍內
- ✅ CI Pipeline 運行且 Lint + Validate + Test 全綠
- ✅ 所有團隊成員理解 SDD 流程與工具
- ✅ Sprint 1 任務清單 Ready（至少 80% 細化完成）

### 應該達成（Go with Risk）
- 🟡 資產規範與命名規則全員確認
- 🟡 PSD 範本完成（至少部分符號）
- 🟡 測試覆蓋率 ≥ 60%（基線）

### 可延後（Plan B）
- ⚪ 資產切圖自動化腳本（Week 1 補）
- ⚪ 視覺回歸測試設定（Week 2 補）
- ⚪ 多語系資產（Week 4 補）

---

## 🎯 下一步：Week 1 準備

### Week 1 焦點（預告）
- 數值：規格 v1.0 精煉（RTP ±2%）
- 後端：Spin API 完整實作 + 確定性驗證
- 前端：5x3 盤面渲染 + 基本動畫
- 美術：完成所有符號 normal 狀態
- 測試：引擎單元測試覆蓋率 ≥ 80%

### Week 1 預備動作
- [ ] 企劃準備 Sprint 1 Planning 會議議程
- [ ] 數值準備規格調整方案（3 個候選）
- [ ] 測試準備測試案例清單（引擎模組）

---

**本檔案維護**：每日更新進度，完成項目打勾 ✅

**最後更新**：2025-10-06
