# AI Agent 任務待辦清單（範例遊戲：Basic 5x3）

說明：本清單以現有範例規格 `src/specs/examples/basic-slot.json` 為基準，對應專案文件《SDD-開發方案計劃書.md》與《SDD+AI-開發方案計劃書.md》。任務依角色（Agent）與開發階段拆解，附上輸入、產出、完成條件與範例指令，支援看板化管理。

狀態標記：
- Todo / Doing / Blocked / Done
- 風險：⚠（需關注）/ ❗（關鍵）

---

## Phase 0：準備與基礎設施

### AG-SPEC-000：建立規格模板與規範
- 角色：Spec Agent（人協作：數值企劃）
- 輸入：題材/盤面/目標 RTP
- 產出：規格模板（已含欄位說明）
- 完成條件：模板通過 Schema 驗證（空白值允許）
- 指令：N/A（文檔資產）
- 狀態：Todo

### AG-QA-000：最小可行測試集（MVT）
- 角色：QA Agent（人協作：QA）
- 輸入：當前專案結構
- 產出：1）Schema 驗證測試 2）引擎確定性測試
- 完成條件：`npm test` 全綠，CI 可跑
- 指令：`npm test --silent`
- 狀態：Todo

---

## Phase 1：規格設計與驗證（SDD 核心）

### AG-SPEC-101：產出初版規格（靠近目標 RTP）
- 角色：Spec Agent（人協作：數值企劃）
- 輸入：目標 RTP/Vol、盤面 5x3
- 產出：`src/specs/examples/basic-slot.json` 初版
- 完成條件：結構通過、RTP 初估 ±2%
- 指令：
  - `npm run -s cli -- validate -s src/specs/examples/basic-slot.json`
  - `npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 100000`
- 狀態：Todo

### AG-QA-101：規格一致性檢查
- 角色：QA Agent
- 輸入：初版規格
- 產出：一致性報告（未辨識鍵、空 strip、無效 payline 等）
- 完成條件：零高風險錯誤；中風險有註記
- 指令：`npm run -s cli -- validate -s src/specs/examples/basic-slot.json`
- 狀態：Todo

---

## Phase 2：引擎原型與前後端串接

### AG-BE-201：Spin API 合約草案
- 角色：BE Agent（人協作：後端）
- 輸入：規格欄位與引擎輸出
- 產出：Spin 請求/回應 JSON 合約
- 完成條件：前/後端一致；含審計欄位（seed、grid、wins）
- 指令：N/A（合約 JSON）
- 狀態：Todo

### AG-FE-201：UI 骨架生成建議
- 角色：FE Agent（人協作：前端）
- 輸入：規格盤面、符號清單
- 產出：畫面結構、元件樹、動效佔位
- 完成條件：可渲染 5x3，事件流（spin/stop/showWins）走通
- 指令：`npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo`
- 狀態：Todo

### AG-QA-202：確定性測試
- 角色：QA Agent
- 輸入：種子 seed 與結果對
- 產出：相同 seed → 相同結果的測試
- 完成條件：同 seed 同 grid/wins；CI 全綠
- 指令：`npm test --silent`
- 狀態：Todo

---

## Phase 3：美術與內容整備

### AG-ASSET-301：資產清單生成與校驗
- 角色：Asset Agent（人協作：美術）
- 輸入：規格中 symbols/paylines/features
- 產出：`assets/manifest.json`、尺寸/命名/壓縮檢查報告
- 完成條件：無缺漏資產；命名與規格一致
- 指令：N/A（可擴充腳本 validate:assets）
- 狀態：Todo

### AG-FE-302：資產載入策略建議
- 角色：FE Agent
- 輸入：資產清單與檔案大小
- 產出：preload/lazy 分類與快取策略
- 完成條件：首屏 < 2s，轉軸 FPS ≥ 60
- 指令：N/A（方案文檔）
- 狀態：Todo

---

## Phase 4：數值調參與 A/B 測試

### AG-MATH-401：啟發式優化（RTP/Vol）
- 角色：Math Optimizer Agent（人協作：數值）
- 輸入：目標 RTP/Vol、迭代數、spins
- 產出：最佳規格候選與比較報告
- 完成條件：RTP 偏差 ≤ 1%，Vol 符合區間
- 指令：
  - `npm run -s cli -- optimize -s src/specs/examples/basic-slot.json --targetRTP 0.95 --spins 2000 --iters 50`
  - `npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 1000000`
- 狀態：Todo

### AG-OPS-402：變體管理與風險評估
- 角色：Ops Agent（人協作：後端/營運）
- 輸入：A/B 規格、MaxWin、HitRate 區間
- 產出：風險矩陣與灰度發布計畫
- 完成條件：監管區間合規；回滾策略定義
- 指令：N/A（方案文檔）
- 狀態：Todo

---

## Phase 5：整合測試與穩定性

### AG-QA-501：覆蓋率提升與邊界場景
- 角色：QA Agent
- 輸入：規格與引擎 API
- 產出：極值/邊界測試、自動化報告
- 完成條件：覆蓋率 ≥ 80%，E2E 穩定
- 指令：`npm test --silent`
- 狀態：Todo

### AG-FE-502：效能回歸基線
- 角色：FE Agent
- 輸入：性能指標（LCP、FPS、p95）
- 產出：效能基線與回歸告警規則
- 完成條件：基線達標且加入 CI 檢查
- 指令：N/A（CI 設定）
- 狀態：Todo

---

## Phase 6：合規、審計與上線

### AG-BE-601：審計回放端點
- 角色：BE Agent
- 輸入：roundId、seed、spec snapshot
- 產出：`/api/verify/:roundId` 端點
- 完成條件：位元級一致回放；審計紀錄保存
- 指令：N/A（後端程式與測試）
- 狀態：Todo

### AG-OPS-602：合規文件自查清單
- 角色：Ops Agent
- 輸入：RTP 報告、RNG 認證、PAR Sheet
- 產出：合規 checklist 與缺漏報告
- 完成條件：無缺漏項；文件可交付監管
- 指令：N/A（文件）
- 狀態：Todo

---

## Phase 7：營運與持續優化

### AG-OPS-701：RTP 漂移監控與告警
- 角色：Ops Agent
- 輸入：實際 RTP（日/週）、模擬 RTP
- 產出：漂移圖與告警規則
- 完成條件：|實際-模擬| > 2% 即告警
- 指令：N/A（監控平台）
- 狀態：Todo

### AG-MATH-702：再訓練與小幅調參
- 角色：Math Optimizer Agent
- 輸入：近期營運資料、玩家行為特徵（匯總）
- 產出：微調規格建議與影響評估
- 完成條件：改版方案與 AB 設計就緒
- 指令：`npm run -s cli -- optimize -s src/specs/examples/basic-slot.json --iters 30 --spins 5000`
- 狀態：Todo

---

## 共用工件與驗收
- 工件：
  - 規格檔：`src/specs/examples/basic-slot.json`
  - 報告：模擬報告、優化比較、資產檢核、效能基線
  - 合約：Spin API、審計端點規格
- 驗收總則：
  - Schema/單元/整合/E2E/視覺/壓力 全綠
  - RTP/Vol/HitRate 符合定義區間
  - 可重現：保留 seed、版本與結果

---

## 看板列印版（摘要）
- Todo：AG-SPEC-000 / AG-QA-000 / AG-SPEC-101 / AG-QA-101 / AG-BE-201 / AG-FE-201 / AG-QA-202 / AG-ASSET-301 / AG-FE-302 / AG-MATH-401 / AG-OPS-402 / AG-QA-501 / AG-FE-502 / AG-BE-601 / AG-OPS-602 / AG-OPS-701 / AG-MATH-702
- Doing：—
- Blocked：—
- Done：—
