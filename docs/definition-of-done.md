# Definition of Done (DoD) - 完成定義

## 文件資訊
- **版本**：v1.0
- **生效日期**：2025-10-06
- **適用範圍**：所有開發任務與交付物
- **維護者**：Tech Lead + QA Lead

---

## 總則

**Definition of Done（完成定義）** 是團隊共識的品質標準，用於判斷一個任務或功能是否「真正完成」。
所有工作項目（User Story / Task / Bug Fix）必須滿足對應的 DoD 才能標記為 `Done`。

---

## 通用 DoD（All Tasks）

所有任務必須滿足以下基本標準：

### 代碼品質
- [ ] **Lint 檢查通過**：`npm run lint` 無錯誤、無警告
- [ ] **TypeScript 檢查通過**：`npx tsc --noEmit` 無型別錯誤
- [ ] **代碼審查完成**：至少 1 位 Reviewer 批准（PR Approved）
- [ ] **無 TODO 註解**：臨時 TODO 必須移除或轉為 Issue
- [ ] **無 console.log**：開發用 log 必須移除或改為 logger

### 測試
- [ ] **相關測試通過**：`npm test` 全綠
- [ ] **覆蓋率達標**：新增代碼覆蓋率 ≥ 80%（單元測試）
- [ ] **無 Flaky Tests**：測試穩定，連續執行 3 次均通過

### 文檔
- [ ] **代碼註解完整**：複雜邏輯有註解說明
- [ ] **API 文檔更新**（如適用）：OpenAPI spec 或 JSDoc
- [ ] **README 更新**（如新增功能）：使用說明與範例

### CI/CD
- [ ] **CI Pipeline 全綠**：所有自動化檢查通過
- [ ] **無合併衝突**：與 `main` 分支無衝突
- [ ] **Commit 訊息規範**：遵循 Conventional Commits（`feat:`, `fix:`, `chore:` 等）

---

## 規格變更 DoD（Spec Changes）

適用於 `src/specs/**/*.json` 的變更。

### 數學驗證
- [ ] **Schema 驗證通過**
  ```bash
  npm run cli -- validate -s <spec-file>
  ```
  無錯誤訊息

- [ ] **模擬測試通過**
  ```bash
  npm run cli -- simulate -s <spec-file> --spins 100000 --seed validation-$(date +%s)
  ```
  - **Phase 1-2（Week 1-3）**：RTP 偏差 ≤ 5%
  - **Phase 3-4（Week 4-6）**：RTP 偏差 ≤ 2%
  - **Phase 5+（Week 7+）**：RTP 偏差 ≤ 1%

- [ ] **關鍵指標在範圍內**
  - Hit Rate：在定義區間（如 0.25 - 0.45）
  - Volatility：符合設計標籤（Low/Medium/High）
  - Max Win：≤ 設定上限（如 5000x）

### 影響評估
- [ ] **變更前後對比報告**：附於 PR，包含 RTP/HitRate/Vol 變化
- [ ] **影響面分析**：列出影響的模組（symbols/reels/paytable/paylines 等）
- [ ] **向後相容性確認**：現有測試是否需調整

### 審核
- [ ] **Math Lead 批准**：規格變更需數值負責人審核
- [ ] **風險評估完成**：標註風險等級（低/中/高）與緩解措施

### 文檔
- [ ] **CHANGELOG.md 更新**：記錄變更內容與版本號
- [ ] **Git Tag 標記**（重大變更）：`spec-v{x.y.z}`

---

## 引擎/後端 DoD（Engine/Backend）

適用於 `src/engine/**` 與後端 API 的變更。

### 功能完整性
- [ ] **功能實作完成**：符合需求規格或 AC（Acceptance Criteria）
- [ ] **確定性驗證**：同 seed 產生同結果（回放測試通過）
- [ ] **邊界條件處理**：極值、空輸入、錯誤輸入均有處理

### 測試
- [ ] **單元測試覆蓋率 ≥ 80%**
- [ ] **整合測試通過**（如為 API）
  ```bash
  npm run test:integration
  ```
- [ ] **確定性測試通過**
  ```typescript
  expect(spin(spec, { seed: 'test' })).toEqual(spin(spec, { seed: 'test' }))
  ```

### 效能
- [ ] **效能基準達標**
  - 單次 Spin < 10ms（本地）
  - API p95 < 100ms（含網路）
  - 無明顯記憶體洩漏

### 審計
- [ ] **審計紀錄完整**（如為 Spin API）
  - 記錄 seed、timestamp、grid、wins、totalWin
  - 回放端點可驗證（`/api/verify/:roundId`）

---

## 前端 DoD（Frontend）

適用於 `src/fe/**` 與前端渲染的變更。

### 功能完整性
- [ ] **視覺符合設計稿**：UI/UX 與設計規格一致
- [ ] **互動流暢**：無明顯卡頓或延遲
- [ ] **響應式設計**（如適用）：桌機/平板/手機均正常顯示

### 測試
- [ ] **元件測試通過**（如使用 Jest/Vitest）
- [ ] **視覺回歸測試通過**（如已建立）
  ```bash
  npm run test:visual
  ```
  快照無差異或差異已確認為預期

### 效能
- [ ] **FPS ≥ 60**：動畫播放流暢（使用 Chrome DevTools 驗證）
- [ ] **首屏載入 < 2s**（桌機）：Lighthouse 評分 ≥ 80
- [ ] **資產優化**：圖片壓縮、懶載入策略實作

### 相容性
- [ ] **瀏覽器相容性測試**（至少 Chrome、Safari、Firefox 最新版）
- [ ] **行動裝置測試**（iOS Safari、Android Chrome）

### 無障礙
- [ ] **鍵盤導航可用**：Tab 鍵可切換焦點
- [ ] **螢幕閱讀器友好**（選配）：重要元素有 `aria-label`

---

## 美術資產 DoD（Art Assets）

適用於 `assets/**` 的資產交付。

### 完整性
- [ ] **資產清單齊全**：規格中所有符號/按鈕/UI 均有對應檔案
- [ ] **多語系齊全**：cn/tw/en 資產完整（如適用）
- [ ] **狀態齊全**
  - 按鈕：up/hover/down/disable 四態
  - 符號：至少 normal（glow/blur 選配）

### 命名規範
- [ ] **檔名符合規範**：遵循 `docs/asset-naming-guide.md`
  - 全小寫、底線分隔、無空格
  - 格式正確：`{category}_{context}_{state}_{lang}.{ext}`
- [ ] **資產檢核通過**
  ```bash
  node scripts/check-assets.js --spec <spec-file> --assets assets/
  ```
  無 P0 錯誤（P1 警告可接受）

### 技術規格
- [ ] **尺寸符合規範**
  - 符號：240×240px（±5px 容差）
  - 按鈕：≥ 88×88px（熱區）
  - 背景：依設計規格
- [ ] **格式正確**
  - 透明元件：PNG-24（含 Alpha）
  - 不透明背景：JPG (Q85-90)
  - 現代格式：WebP（漸進採用）
- [ ] **壓縮達標**
  - PNG < 200KB（單檔）
  - JPG < 500KB（背景）
  - 總包 < 10MB（首屏 < 3MB）

### 品質
- [ ] **無意外白邊/黑邊**：透明 PNG 邊緣乾淨
- [ ] **視覺品質確認**：設計師簽核
- [ ] **manifest.json 更新**：資產索引與元數據正確

---

## 測試 DoD（QA）

適用於測試案例與測試報告的交付。

### 測試案例
- [ ] **測試案例完整**：涵蓋正常流程、邊界條件、錯誤處理
- [ ] **測試案例可執行**：自動化測試可重複執行
- [ ] **測試數據準備**：Mock 數據或 Fixture 齊全

### 測試執行
- [ ] **所有測試通過**：`npm test` 無失敗案例
- [ ] **覆蓋率達標**：總覆蓋率 ≥ 80%
- [ ] **無 Flaky Tests**：穩定性驗證（連續 10 次執行均通過）

### 測試報告
- [ ] **測試報告產出**：包含通過率、覆蓋率、執行時間
- [ ] **缺陷記錄**：失敗案例記錄於 Issue Tracker
- [ ] **回歸測試基線更新**（如適用）

---

## 文檔 DoD（Documentation）

適用於文檔變更（`docs/**`, `README.md`, `CHANGELOG.md` 等）。

### 內容品質
- [ ] **內容完整**：涵蓋必要資訊（目的、使用方式、範例）
- [ ] **內容正確**：經驗證，無過時資訊
- [ ] **語言清晰**：繁體中文或英文，無語病、無錯字

### 格式
- [ ] **Markdown 格式正確**：標題層級、列表、代碼區塊正確
- [ ] **連結有效**：內部連結與外部連結均可訪問
- [ ] **代碼範例可執行**：代碼片段經測試確認可用

### 維護
- [ ] **版本號更新**（如適用）：文檔標註版本與日期
- [ ] **變更紀錄**（重要文檔）：記錄修訂歷史

---

## 發佈 DoD（Release）

適用於正式版本發佈（Production Release）。

### 代碼準備
- [ ] **所有 DoD 達成**：上述所有項目均完成
- [ ] **版本號更新**：`package.json` 版本號遵循 SemVer
- [ ] **CHANGELOG.md 更新**：記錄本版變更

### 測試
- [ ] **完整測試通過**
  - 單元測試
  - 整合測試
  - E2E 測試
  - 視覺回歸測試
  - 壓力測試（如適用）
- [ ] **回放測試通過**：隨機抽 1000 rounds，位元級一致
- [ ] **大樣本模擬通過**：≥ 100k spins，RTP 偏差 ≤ 1%

### 合規
- [ ] **審計文檔齊備**
  - PAR Sheet（完整版）
  - 數學報告（RTP/Vol/HitRate 分佈）
  - 審計端點可用（`/api/verify`）
- [ ] **RNG 認證**（如需要）：第三方認證通過或報告提交

### 部署準備
- [ ] **環境變數配置**：Production 配置確認
- [ ] **資料庫遷移**（如適用）：Migration 腳本測試完成
- [ ] **回滾計劃**：Rollback 步驟明確

### 監控
- [ ] **監控接入**：RTP 漂移、錯誤率、效能指標監控啟用
- [ ] **告警設定**：關鍵指標告警閾值設定

### 文檔
- [ ] **發佈筆記**：Release Notes 發布
- [ ] **運維手冊**：Runbook 更新（部署步驟、回滾步驟、故障排除）

---

## DoD 檢查流程

### PR Review 時
1. **自我檢查**：提交 PR 前自行檢查對應 DoD
2. **PR 描述**：在 PR 中勾選完成的 DoD 項目
3. **Reviewer 驗證**：Reviewer 依 DoD 檢查，未達標不批准

### Sprint Review 時
1. **Demo 展示**：展示可運行的增量
2. **DoD 確認**：對照 DoD 逐項確認
3. **利害關係人接受**：Product Owner 批准

### Gate 評審時（Week 1-8）
1. **Gate DoD 檢查**：對應 Phase 的 DoD 全部達成
2. **Go/No-Go 決策**：Tech Lead + PM 共同決策
3. **記錄存檔**：檢查結果記錄於 `docs/gates/gate-{n}-report.md`

---

## DoD 豁免流程

**原則**：DoD 不應輕易豁免，但緊急情況可臨時放寬。

### 申請豁免
1. **填寫豁免申請**：說明原因、影響、緩解措施、補償計劃
2. **Tech Lead 批准**：重大豁免需 PM 共同批准
3. **建立補償 Issue**：豁免項目轉為 Issue，優先級 P1

### 豁免範例
- **可豁免**：
  - 覆蓋率 75% vs 80%（計劃下週補）
  - 選配多語系資產延後（不影響核心功能）
- **不可豁免**：
  - 確定性測試失敗
  - RTP 偏差 > 5%（Phase 1-2）或 > 2%（Phase 3+）
  - CI Pipeline 紅燈

---

## DoD 維護

### 定期檢視
- **每個 Sprint Retrospective**：檢視 DoD 是否合理
- **每個 Phase 結束**：評估 DoD 是否需調整

### 更新流程
1. **提出修改建議**：任何人可提
2. **團隊討論**：Sprint Planning 或專門會議
3. **共識決策**：全員同意後更新
4. **版本記錄**：文檔標註版本與變更日誌

---

## 附錄：DoD 快速檢查清單

### 代碼變更
```
[ ] Lint 通過
[ ] Typecheck 通過
[ ] Tests 通過
[ ] 覆蓋率 ≥ 80%
[ ] PR Approved
[ ] CI 全綠
```

### 規格變更
```
[ ] Validate 通過
[ ] Simulate 通過（RTP ±1-5% 依階段）
[ ] 對比報告附於 PR
[ ] Math Lead 批准
[ ] CHANGELOG 更新
```

### 資產交付
```
[ ] 命名規範符合
[ ] 尺寸規格符合
[ ] 壓縮達標
[ ] 資產檢核通過
[ ] manifest.json 更新
[ ] 設計師簽核
```

### 功能交付
```
[ ] 功能完整
[ ] 測試完整
[ ] 文檔更新
[ ] 效能達標
[ ] 審核批准
[ ] CI 全綠
```

---

**文檔版本**：v1.0 | 2025-10-06  
**維護者**：Tech Lead + QA Lead  
**下次檢視**：Sprint 2 Retrospective
