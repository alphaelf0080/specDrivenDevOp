# SDD + AI 輔助：Slot Game 完整開發計劃（含規格範例、執行方式、里程碑與排程）

本計劃以「規格驅動開發（SDD）」為核心，結合 AI Agent 輔助，加速並穩定地交付一款 5x3 經典轉軸 Slot 遊戲。文件涵蓋角色分工、規格範例、執行方式、里程碑與排程、驗收標準、風險與緩解。

—

## 1. 目標與成功指標
- 產品目標：於 8 週內交付具生產就緒品質的 5x3 Slot（Base Game，無複雜 Bonus）。
- 成功指標（KPI）：
  - 模擬 RTP 接近目標（±1%）且營運期間漂移 < 2%。
  - 引擎確定性：同 seed → 同 grid 與 wins。
  - 測試通過率 100%、覆蓋率 ≥ 80%。
  - 首屏載入 < 2s（桌機），轉軸動畫 FPS ≥ 60。
  - 審計可回放、規格可追溯（版本/seed/結果）。

—

## 2. 角色分工與 AI Agent 配置
- 美術（Art）＋ Asset Agent：產資清單、命名規範、尺寸/壓縮檢核、自動化報表。
- 前端（FE）＋ FE Agent：UI 骨架、資產載入策略、動畫節奏與回合播放。
- 後端（BE）＋ BE Agent：Spin API/審計回放、版本/seed 紀錄、灰度與配置管理。
- 數值（Math/Spec）＋ Spec Agent／Math Optimizer Agent：規格設計、RTP/Vol 模擬與優化。
- 測試（QA）＋ QA Agent：Schema/單元/整合/E2E、確定性測試、效能回歸基線。

AI Agent 的任務拆解與模板，參考：`docs/AI-Agent-任務待辦清單-範例遊戲.md`。

—

## 3. 方法論：SDD + AI
- 規格作為單一真理來源：`src/specs/examples/basic-slot.json`。
- Schema 驗證 + 模擬指令 + 啟發式優化構成閉環。
- AI Agent 用於：生成初版規格、檢查一致性、建議資產與前端結構、數值優化、測試案例擴充。

—

## 4. 規格範例（精簡版）
以下為簡化的 5x3 規格範例，僅示意主要欄位。完整可參考現有範例：`src/specs/examples/basic-slot.json`。

```json
{
  "name": "Basic 5x3 Demo",
  "layout": { "reels": 5, "rows": 3 },
  "bet": { "base": 1 },
  "symbols": ["A","K","Q","J","T","W","S"],
  "reels": [
    ["A","K","Q","J","T","A","Q","J","K","T","W"],
    ["K","Q","J","T","A","K","J","Q","T","A","W"],
    ["Q","J","T","A","K","Q","T","A","J","K","W"],
    ["J","T","A","K","Q","J","A","K","T","Q","W"],
    ["T","A","K","Q","J","T","K","Q","A","J","W"]
  ],
  "paylines": [
    [[0,0],[1,0],[2,0],[3,0],[4,0]],
    [[0,1],[1,1],[2,1],[3,1],[4,1]],
    [[0,2],[1,2],[2,2],[3,2],[4,2]],
    [[0,0],[1,1],[2,2],[3,1],[4,0]],
    [[0,2],[1,1],[2,0],[3,1],[4,2]]
  ],
  "paytable": {
    "A": { "3": 5, "4": 20, "5": 50 },
    "K": { "3": 5, "4": 15, "5": 40 },
    "Q": { "3": 4, "4": 10, "5": 30 },
    "J": { "3": 3, "4": 8,  "5": 25 },
    "T": { "3": 2, "4": 6,  "5": 20 },
    "W": { "substitute": true },
    "S": { "scatter": { "3": 2, "4": 10, "5": 50 } }
  }
}
```

注意：
- 符號 `W` 為 wild、`S` 為 scatter。
- 實際 RTP 由輪帶分佈 + 賠付表共同決定；請以模擬結果為準。

—

## 5. 執行方式（指令與流程）
- 驗證規格（Schema + 邏輯）：
```sh
npm run -s cli -- validate -s src/specs/examples/basic-slot.json
```
- 單次旋轉（可帶 seed 再現）：
```sh
npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo
```
- 批量模擬（輸出 RTP/HitRate/Vol）：
```sh
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 100000
```
- 啟發式優化（接近目標 RTP/Vol）：
```sh
npm run -s cli -- optimize -s src/specs/examples/basic-slot.json --targetRTP 0.95 --spins 2000 --iters 50
```
- VS Code Task（已內建範例）：
  - 任務：`slot:simulate`（5000 次、seed=demo）

—

## 6. 里程碑與排程（建議 8 週，雙週 Sprint）

里程碑摘要：
- M0 啟動（週 1）：環境就緒、Schema/CLI/測試基線、AI 任務看板。
- M1 規格 v1（週 2）：初版規格接近目標 RTP（±2%）。
- M2 原型（週 4）：Spin API、前端可視化播放、確定性測試通過。
- M3 內容整備（週 5）：資產清單與載入策略、UI 骨架穩定。
- M4 數值平衡（週 6）：優化至目標 RTP（±1%）、風險評估。
- M5 整合測試（週 7）：覆蓋率 ≥ 80%、效能基線建立。
- M6 合規審計（週 8）：審計回放、合規文件清單、發佈準備。

詳細排程（RACI 與輸出）：

| 週 | 里程碑 | 主要任務 | 輸出 | 責任人（R/A/C/I） |
|---|---|---|---|---|
| 1 | M0 啟動 | 專案初始化、測試基線、AI 看板 | 綠燈 Build/Lint/Test、AG Backlog | TL(A), QA(R), All(C/I) |
| 2 | M1 規格 v1 | 規格初版、基本模擬 | spec.json v1、RTP ±2% | Spec(R), Math(C), QA(I) |
| 3-4 | M2 原型 | BE Spin API、FE 回合播放、確定性測試 | 可視化原型、seed 重現 | BE/FE(R), QA(A), Spec(C) |
| 5 | M3 內容 | 資產清單、載入策略、命名/壓縮檢查 | assets/manifest、策略文檔 | Art(R), FE(C), QA(I) |
| 6 | M4 平衡 | 啟發式優化、A/B 變體與風險矩陣 | 最佳候選 spec、風險報告 | Math(R), Ops(C), Spec(A) |
| 7 | M5 整測 | 覆蓋率提升、效能基線、E2E | 測試報告、性能報表 | QA(R), FE/BE(C) |
| 8 | M6 合規 | 審計回放端點、合規 checklist | /api/verify、合規檔 | BE(R), Ops(A), QA(C) |

—

## 7. 驗收標準（Definition of Done）
- Schema 驗證通過；Zod 錯誤訊息可讀（繁中）。
- 同一 seed 下，grid/wins 完全一致；回放端點位元級一致。
- 模擬 100k 次：RTP 偏差 ≤ 1%，HitRate/Vol 落在定義區間。
- 測試：單元/整合/E2E 全綠，覆蓋率 ≥ 80%。
- 效能：首屏 < 2s、動畫 FPS ≥ 60（桌機）；性能回歸監控已接入。
- 資產：命名/尺寸/壓縮符合檢核；資產清單與規格一致。
- 文檔：規格版本化、變更紀錄、審計與合規文件齊備。

—

## 8. 風險與緩解
- RTP 偏差大：提高模擬樣本量、收斂條件、限制極端賠付；引入多目標優化。
- 規格/程式漂移：CI 驗證規格快照；強制 PR 檢查（validate/simulate）。
- 效能退化：建立性能基線與告警；資產分級載入與快取。
- 合規風險：RNG 認證文件、回放 API、Log 保留策略與資料遮罩。

—

## 9. 產出物與交付清單
- 規格：`src/specs/examples/basic-slot.json`（版本化）。
- 報告：模擬與優化比較、風險矩陣、效能基線、測試報告。
- 合約：Spin API、審計回放 API、資產清單與載入策略。
- 自動化：CLI 指令與 VS Code 任務；CI 驗證與報告。

—

## 10. 附錄 A：命令速查
```sh
# 驗證規格
npm run -s cli -- validate -s src/specs/examples/basic-slot.json
# 單次旋轉（可帶 seed）
npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo
# 批量模擬（RTP/HitRate/Vol）
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 100000
# 啟發式優化（接近目標 RTP/Vol）
npm run -s cli -- optimize -s src/specs/examples/basic-slot.json --targetRTP 0.95 --spins 2000 --iters 50
```

—

## 11. 附錄 B：欄位備忘（摘要）
- layout.reels/rows：盤面尺寸
- reels：每輪帶陣列（上→下順序）
- paylines：線路定義（[col,row] 座標）
- paytable：每符號對應賠付（3/4/5 of a kind），wild/scatter 設定
- bet.base：基礎投注單位

—

本計劃已與現有專案指令與範例對齊，可直接依「里程碑與排程」展開執行；AI Agent 的分工細節與待辦可同步使用 `docs/AI-Agent-任務待辦清單-範例遊戲.md` 進行看板化管理。