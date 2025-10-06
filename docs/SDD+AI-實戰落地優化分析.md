# SDD + AI Agent 開發模式：實戰落地優化分析

## 文件資訊
- 版本：v1.0
- 日期：2025-10-06
- 目的：將理論計劃書轉為可執行的實戰藍圖，識別瓶頸與優化點

---

## 一、現況分析：計劃書的優勢與盲點

### ✅ 現有優勢
1. **規格為 SSOT** 的理念清晰，架構完整
2. **AI Agent 分工明確**，七大角色職責不重疊
3. **8 週排程與 RACI** 矩陣提供時間表
4. **確定性與可重現性** 是核心，符合合規需求
5. **CLI 工具鏈** 已實作（validate/simulate/optimize）

### ⚠️ 實戰盲點與瓶頸
1. **前置工作不明確**：計劃書從 Week 1 開始，但「Week 0」的準備工作未詳述
2. **協作節拍模糊**：各角色「何時交付、如何交接、誰守門」不夠具體
3. **AI Agent 落地方式抽象**：Prompt 範例不足，如何實際調用未說明
4. **變更流程缺失**：規格變更時，如何同步前端/後端/美術？
5. **風險緩衝不足**：8 週無緩衝週，假設過於理想
6. **資產與數值並行風險**：Phase 3（資產）與 Phase 4（數值平衡）時序可能衝突
7. **測試策略不夠前置**：QA 在 Phase 5 才全面介入，應更早期左移
8. **CI/CD 細節缺失**：pipeline 只有概念，缺乏實際 YAML/指令
9. **多語系與 i18n 未單獨規劃**：散落在各處，應整合

---

## 二、優化方案：五大改進面向

### 改進 1：補強 Week 0 前置工作（Critical Path）

#### 問題
計劃書從 Week 1 開始，但實際上需要 Week 0 的「對齊與基礎設施」階段。

#### 優化方案：Week 0 前置清單（5-7 個工作日）

**Day 0-1：目標對齊與凍結**
- [ ] 召開 Kickoff 會議，凍結目標：
  - Base Game RTP 目標（如 95%）、波動度（Medium: 25-35）
  - MaxWin 上限（如 5000x）、盤面尺寸（5x3 固定）
  - 不做項目清單（No Bonus、No Feature、No Progressive）
- [ ] 定義 DoD（Definition of Done）指標：
  - 數學：RTP 偏差 ≤ 1%、100k+ spins 模擬通過
  - 效能：首屏 < 2s、FPS ≥ 60、API p95 < 100ms
  - 測試：覆蓋率 ≥ 80%、E2E 綠燈率 ≥ 95%
- [ ] 建立風險登記簿（Risk Register）與每週檢視機制

**Day 2-3：規格骨架與基線**
- [ ] 從 `basic-slot.json` 複製為 `src/specs/games/<project-name>.json` v0.1
- [ ] 跑初版模擬建立基線：
  ```bash
  npm run cli -- validate -s src/specs/games/<project-name>.json
  npm run cli -- simulate -s src/specs/games/<project-name>.json --spins 10000 --seed baseline
  ```
- [ ] 將基線報告存為 `docs/baselines/week0-baseline.json`
- [ ] 建立規格版本控制策略：Git Tag `spec-v0.1.0`

**Day 4-5：CI/CD 與守門機制**
- [ ] 建立 PR 模板（`.github/PULL_REQUEST_TEMPLATE.md`）：
  - 變更摘要、影響面、seed、執行指令、結果快照、風險評估
- [ ] 設定 CI Pipeline（GitHub Actions / GitLab CI）：
  - Stage 1：Lint + Typecheck
  - Stage 2：Schema Validate（所有規格檔）
  - Stage 3：Unit Tests
  - Stage 4：Simulate（小樣本 5k，快速反饋）
  - Stage 5：Report（RTP/HitRate/Vol 自動註解到 PR）
- [ ] 建立 Branch Protection Rules：
  - `main` 需 PR + CI 綠燈 + 1 Approver
  - 規格檔變更需 Math Lead 審核

**Day 6-7：資產規範與任務看板**
- [ ] 確認 `附錄 C` 資產規範，建立：
  - `assets/manifest.json` 空白骨架
  - `docs/asset-naming-guide.md`（命名規則速查）
  - PSD 圖層命名範本（至少 3 符號 + 1 按鈕四態）
- [ ] 建立任務看板（Jira / GitHub Projects）：
  - 泳道：Spec / Engine / FE / BE / Asset / QA / Docs
  - 卡片標籤：P0-Critical / P1-High / P2-Medium
  - 初始 Sprint 0 卡片（約 15-20 張）

**交付物（Week 0 End）**
- ✅ 目標凍結文檔 + DoD 指標表
- ✅ 規格 v0.1 + 基線模擬報告
- ✅ CI Pipeline 運行（至少 Lint + Validate 通過）
- ✅ PR 模板 + Branch Protection 啟用
- ✅ 資產規範 + manifest 骨架
- ✅ Sprint 1 待辦清單（Ready 狀態）

---

### 改進 2：建立「規格變更流程」（Change Management）

#### 問題
規格是 SSOT，但變更時如何同步各職能？缺乏明確流程。

#### 優化方案：規格變更三階段流程

**階段 1：提案與影響評估（Proposal）**
1. 任何人可提 RFC（Request for Change），格式：
   - 變更原因（業務/數學/技術）
   - 影響面（symbols/reels/paytable/paylines/assets）
   - 預估工作量（各角色人日）
2. Math Lead 評估數學影響：
   - 跑 simulate 對比（變更前 vs 變更後）
   - 評估 RTP/Vol/MaxWin 偏移
3. 若影響 > 5% RTP 或需新資產，升級為「重大變更」需全員評審

**階段 2：實作與驗證（Implementation）**
1. 建立 Feature Branch：`feat/spec-<change-id>`
2. 更新規格檔 + 模擬報告
3. 各職能同步變更：
   - **Engine/BE**：調整邏輯（如新符號處理）
   - **FE**：更新渲染層（如新 symbol 圖層）
   - **Asset**：標記缺漏資產，更新 manifest
   - **QA**：補充測試案例（邊界條件）
4. CI 自動跑：validate → simulate → tests
5. PR 附上「變更前後對比報告」（RTP/HitRate/Vol 表格）

**階段 3：評審與合併（Review & Merge）**
1. 守門人檢查（依影響面）：
   - 數學變更：Math Lead
   - 資產變更：Art Lead + Asset Agent 報告
   - API 變更：BE Lead + API 契約測試
2. 評審會議（若為重大變更）：15 分鐘，全員參與
3. 合併後自動：
   - Git Tag `spec-v0.2.0`
   - 觸發完整模擬（100k spins）
   - 更新 `docs/CHANGELOG.md`

**工具支援**
- 建立 `scripts/diff-spec.js`：比對兩版規格差異並生成影響報告
- CI 自動註解 PR：「此變更影響 3 個符號、2 條 payline，預估 RTP 從 94.8% → 95.2%」

---

### 改進 3：AI Agent 具體落地方案

#### 問題
計劃書列出 AI Agent 職責，但未說明「如何調用」「Prompt 範例」「結果如何整合」。

#### 優化方案：AI Agent 工作流程標準化

**標準調用流程（以 Math Optimizer Agent 為例）**

**輸入準備**
```bash
# 1. 準備規格與目標
SPEC_FILE="src/specs/games/my-game.json"
TARGET_RTP=0.95
TARGET_VOL=30

# 2. 產生 Agent 輸入包（JSON）
cat > /tmp/agent-input.json <<EOF
{
  "task": "optimize-rtp",
  "spec": $(cat $SPEC_FILE),
  "targets": {
    "rtp": $TARGET_RTP,
    "volatility": $TARGET_VOL
  },
  "constraints": {
    "maxWin": 5000,
    "hitRateMin": 0.25,
    "hitRateMax": 0.45
  },
  "config": {
    "spins": 10000,
    "iterations": 50,
    "seed": "opt-$(date +%s)"
  }
}
EOF
```

**AI Agent Prompt 模板**
```markdown
# Math Optimizer Agent Prompt

## Role
你是老虎機數學優化專家，負責調整規格以接近目標 RTP 與波動度。

## Context
- 現有規格：{spec.json}
- 目標 RTP：{targetRTP} ± 1%
- 目標波動度：{targetVol} ± 5
- 約束條件：{constraints}

## Task
使用啟發式搜尋（調整 strips 順序、paytable 倍率），找出最佳候選規格。

## Input
- 規格檔路徑：{specFile}
- CLI 指令：`npm run cli -- optimize -s {specFile} --targetRTP {rtp} --targetVol {vol} --iters {n}`

## Output Format
返回 JSON：
{
  "candidates": [
    {
      "rank": 1,
      "spec": {...},
      "metrics": {"rtp": 0.951, "volatility": 29.8, "hitRate": 0.32},
      "changes": ["調整 A 符號密度 +15%", "降低 Scatter 賠率 10%"]
    }
  ],
  "recommendation": "候選 1 最接近目標，建議採用"
}

## Validation
1. 所有候選需通過 Schema 驗證
2. RTP 必須在 [0.90, 0.98] 範圍
3. 變更幅度說明需清楚
```

**整合回主流程**
```bash
# 3. 調用 AI Agent（假設透過 API 或 CLI wrapper）
./scripts/invoke-agent.sh math-optimizer /tmp/agent-input.json > /tmp/agent-output.json

# 4. 驗證 Agent 輸出
npm run cli -- validate -s /tmp/agent-output.json

# 5. 對比模擬
npm run cli -- simulate -s $SPEC_FILE --spins 10000 > /tmp/before.txt
npm run cli -- simulate -s /tmp/agent-output.json --spins 10000 > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt

# 6. 人工評審後採用
cp /tmp/agent-output.json $SPEC_FILE
git add $SPEC_FILE
git commit -m "chore(spec): apply Math Optimizer recommendations [AI-assisted]"
```

**其他 Agent 快速參考**

| Agent | 輸入 | CLI/工具 | 輸出 |
|-------|------|---------|------|
| **Spec Agent** | GDD 摘要、目標 RTP | GPT-4 + `validate` | 初版規格 JSON |
| **Asset Agent** | spec.json + psd_structure.json | `scripts/check-assets.js` | 缺漏報告 + manifest |
| **QA Agent** | spec.json + engine API | `scripts/gen-tests.js` | 測試案例代碼 |
| **FE Agent** | spec.json + 效能基線 | Copilot + lighthouse | 優化建議清單 |

---

### 改進 4：測試左移與持續驗證

#### 問題
計劃書將 QA 集中在 Phase 5（Week 7），但應更早介入。

#### 優化方案：測試金字塔與左移策略

**測試金字塔（從下到上）**

**L1：Schema & 確定性測試（Week 1 起）**
- 每個規格檔變更 → 自動 validate
- 引擎確定性：同 seed 必產生同 grid/wins
- 覆蓋率：100%（這是基礎，不可妥協）

**L2：單元測試（Week 2-3）**
- 引擎模組：RNG、Reel、Payline、Payout 獨立測試
- 前端元件：Symbol Renderer、Win Animation、UI Buttons
- 覆蓋率目標：≥ 80%

**L3：整合測試（Week 4-5）**
- Spin API E2E：Request → Engine → Response 完整流程
- 前後端整合：Mock API → FE 渲染 → 結果驗證
- 資產載入：manifest → 資源管理器 → 快取策略

**L4：視覺回歸測試（Week 5 起）**
- Playwright/Chromatic 快照比對
- 關鍵畫面：主畫面、中獎、彈窗、多語系切換
- 失敗即阻擋 PR

**L5：壓力與合規測試（Week 6-7）**
- 模擬 100k+ spins，驗證 RTP 穩定性
- 回放測試：隨機抽 1000 rounds，位元級一致
- 速率限制、注入攻擊、審計端點

**左移實踐**
- **Week 1**：QA 與 Math 一起設計「確定性測試套件」
- **Week 2**：QA 與 BE 一起定義「Spin API 契約測試」
- **Week 3**：QA 與 FE 一起建立「視覺回歸基線」
- **每日**：CI 跑 L1+L2，失敗即阻擋合併
- **每週**：完整跑 L1-L4，產出測試報告

**工具鏈**
```yaml
# .github/workflows/test.yml（簡化版）
name: Test Pipeline
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      
      # L1: Schema & 確定性
      - run: npm run cli -- validate -s src/specs/**/*.json
      - run: npm test -- --testPathPattern=deterministic
      
      # L2: 單元測試
      - run: npm test -- --coverage
      
      # L3: 整合測試
      - run: npm run test:integration
      
      # L4: 視覺回歸（PR 限定）
      - if: github.event_name == 'pull_request'
        run: npm run test:visual
      
      # 產出報告
      - run: npm run cli -- simulate -s src/specs/games/*.json --spins 5000
      - uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: reports/
```

---

### 改進 5：排程優化與風險緩衝

#### 問題
8 週排程假設一切順利，無緩衝機制。

#### 優化方案：9 週排程 + 檢查點 + Plan B

**修正排程（9 週 = 8 週開發 + 1 週緩衝）**

| 週次 | 階段 | 關鍵交付 | 檢查點（Go/No-Go） | Plan B |
|-----|------|---------|------------------|--------|
| **Week 0** | 前置 | 目標凍結、規格 v0.1、CI 骨架 | ✅ 基線模擬通過 | - |
| **Week 1** | 規格設計 | spec v1.0、模擬報告 | ✅ RTP ±2% | 延用 v0.1 + 手動調整 |
| **Week 2** | 引擎原型 | Spin API、確定性測試綠 | ✅ API 可呼叫 | Mock API 先行 |
| **Week 3** | UI 原型 | FE 可視化、資產載入管線 | ✅ 動畫播放 FPS ≥ 60 | 使用佔位符資產 |
| **Week 4** | 資產製作 | PSD 結構化、manifest v1 | ✅ 檢核報告無 P0 缺陷 | 分階段交付（符號優先） |
| **Week 5** | 數值平衡 | 優化至 RTP ±1%、變體設計 | ✅ 100k 模擬通過 | 採用 Week 1 基線版本 |
| **Week 6** | 整合測試 | 覆蓋率 ≥ 80%、E2E 綠 | ✅ 測試報告通過 | 降級為 ≥ 70% + 手動補測 |
| **Week 7** | 合規準備 | 審計端點、回放測試 | ✅ 1000 rounds 位元級一致 | 縮小樣本至 100 rounds |
| **Week 8** | 上線準備 | 發佈 Runbook、監控接入 | ✅ Pre-prod 驗證通過 | 延後 1 週上線 |
| **Week 9** | **緩衝週** | 處理 Week 1-8 積壓、回歸測試 | - | - |

**檢查點機制（Go/No-Go Decision）**
- 每週五下午：檢查點評審會議（30 分鐘）
- 評估標準：
  - 🟢 **Go**：關鍵交付完成 ≥ 90%，可進入下週
  - 🟡 **Go with Risk**：完成 70-89%，標記風險項，下週優先處理
  - 🔴 **No-Go**：< 70%，啟動 Plan B，重新評估排程
- 決策者：Tech Lead + Product Owner

**風險緩衝策略**
1. **人力緩衝**：每個職能預留 10% 時間處理突發
2. **技術緩衝**：Week 9 為 100% 緩衝，可提前釋出或處理積壓
3. **範圍緩衝**：準備「可延後功能清單」（如多語系、音效）

---

## 三、協作模式與節拍（Collaboration Cadence）

### 每日節奏（Daily）
- **09:30 站會**（15 分鐘）
  - 輪流報告：昨日完成、今日計劃、阻礙
  - 重點：阻礙優先解決，不討論細節
- **持續整合**
  - 每次 commit → CI 自動跑（Lint + Validate）
  - 每次 PR → 完整測試 + 模擬報告

### 每週節奏（Weekly）
- **週一 10:00 需求細化**（30 分鐘）
  - 下週 Sprint 任務細化，確保 Definition of Ready
- **週三 14:00 風險檢視**（15 分鐘）
  - 檢視風險登記簿，更新緩解措施
- **週五 16:00 檢查點評審**（30 分鐘）
  - Go/No-Go 決策，展示本週交付

### 雙週節奏（Bi-weekly）
- **Sprint Demo**（1 小時）
  - 展示可運行的增量，收集反饋
- **Sprint Retrospective**（45 分鐘）
  - Keep/Problem/Try 格式，持續改進
- **Sprint Planning**（1 小時）
  - 規劃下個 Sprint，分配任務

### 即時協作（Ad-hoc）
- **測試紅燈會議**
  - CI 紅燈超過 2 小時 → 立即召集相關人員（15 分鐘內修復或 revert）
- **規格變更評審**
  - 重大變更（影響 > 5% RTP）→ 24 小時內全員評審

---

## 四、角色任務矩陣（詳細版）

### 企劃（Product Owner）

**Week 0-1：啟動**
- 凍結目標與範圍，建立風險登記簿
- 定義 MVP 與可延後功能清單
- 批准規格 v0.1

**Week 2-5：執行**
- 每週檢查點決策（Go/No-Go）
- 處理需求變更請求（RFC）
- 協調跨職能衝突

**Week 6-8：收尾**
- 驗收測試與合規檢查
- 批准發佈 Runbook
- 規劃 Post-launch 監控

**交付物**
- 目標凍結文檔
- 風險登記簿（每週更新）
- Go/No-Go 決策紀錄

---

### 數值（Math Designer）

**Week 0-1：規格設計**
- 建立規格 v0.1：symbols、reels、paytable
- 執行基線模擬（10k spins）
- 產出初版數學文檔（PAR Sheet 草稿）

**Week 2-3：引擎驗證**
- 與 BE 確認引擎實作與規格一致
- 補充邊界案例測試（全 Wild、全 Scatter）
- 增加模擬樣本至 100k

**Week 4-5：平衡與優化**
- 使用 Optimizer 搜尋最佳候選
- 設計 A/B 變體（如調整 Scatter 頻率）
- 評估 MaxWin 與尖峰風險

**Week 6-8：文檔與合規**
- 完成 PAR Sheet（含所有機率與期望值）
- 產出審計報告（RTP/Vol/HitRate 分佈）
- 支援回放測試驗證

**工具與指令**
```bash
# 每日工作流
npm run cli -- validate -s src/specs/games/my-game.json
npm run cli -- simulate -s src/specs/games/my-game.json --spins 10000 --seed daily-$(date +%F)

# 優化迭代
npm run cli -- optimize -s src/specs/games/my-game.json \
  --targetRTP 0.95 --targetVol 30 --spins 5000 --iters 50

# 變體對比
for variant in A B C; do
  npm run cli -- simulate -s specs/variants/$variant.json --spins 100000 > reports/$variant.txt
done
diff reports/A.txt reports/B.txt
```

**交付物**
- 規格檔（版本化）
- 模擬報告（每週更新）
- PAR Sheet（最終版）
- 數學文檔（供審計）

---

### 美術（Art Designer）

**Week 0-1：規範建立**
- 確認資產命名規則（參考附錄 C）
- 建立 PSD 範本（含定位/預覽/出圖圖層）
- 產出 3 個符號 + 1 個按鈕（四態）範例

**Week 2-3：PSD 結構化**
- 依規格符號清單建立完整 PSD 圖層
- 確保命名符合自動切圖規範
- 完成多語系資產（cn/tw/en）

**Week 4-5：切圖與優化**
- 執行自動切圖（Photoshop Generator 或腳本）
- 壓縮優化（pngquant + cwebp）
- 更新 `assets/manifest.json`

**Week 6-8：視覺回歸與修正**
- 配合視覺回歸測試修正差異
- 補充遺漏資產（依 Asset Agent 報告）
- 最終檢查與交付

**工具與指令**
```bash
# Asset Agent 檢查
node scripts/check-assets.js --spec src/specs/games/my-game.json \
  --psd docs/psd_structure.json \
  --assets assets/

# 批次壓縮
pngquant --quality=65-80 --ext .png --force assets/**/*.png
for f in assets/**/*.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done

# 生成 manifest
node scripts/gen-manifest.js --assets assets/ --output assets/manifest.json
```

**交付物**
- PSD 主檔案（結構化）
- 切圖資產包（含壓縮）
- `assets/manifest.json`
- 資產檢核報告

---

### 前端（Frontend Developer）

**Week 0-1：架構與工具**
- 建立 Canvas/WebGL 渲染骨架
- 實作規格解析器（讀取 spec.json）
- 建立資產載入管線（preload/lazy）

**Week 2-3：UI 原型**
- 渲染 5x3 盤面（依規格 layout）
- 實作旋轉動畫（Mock 結果）
- 基本 UI（下注、線數、旋轉按鈕）

**Week 4-5：整合與優化**
- 與 BE API 整合（真實 Spin）
- 實作中獎動畫（依 paylines）
- 效能優化（FPS 穩定 ≥ 60）

**Week 6-8：視覺回歸與打磨**
- 配合視覺回歸測試
- 多語系切換功能
- 音效整合與同步

**工具與指令**
```bash
# 開發伺服器
npm run dev

# 效能分析
npm run build
npx lighthouse http://localhost:3000 --view

# 視覺回歸
npm run test:visual
```

**交付物**
- 可運行的 FE 應用
- 效能報告（Lighthouse）
- 視覺回歸基線

---

### 後端（Backend Developer）

**Week 0-1：API 設計**
- 定義 Spin API 契約（OpenAPI spec）
- 建立引擎骨架（規格驅動）
- 實作確定性測試（同 seed 同結果）

**Week 2-3：核心引擎**
- 實作 RNG（seeded）
- 實作 Reel Spin、Payline Check、Payout Calc
- 單元測試覆蓋率 ≥ 80%

**Week 4-5：審計與風險**
- 實作審計紀錄（seed、grid、wins、timestamp）
- 建立回放端點（/api/verify/:roundId）
- 速率限制與風險控管

**Week 6-8：整合與上線**
- 與 FE 整合測試
- 壓力測試（100+ req/s）
- 部署與監控接入

**工具與指令**
```bash
# 本地開發
npm run dev:server

# 單元測試
npm test -- --testPathPattern=engine

# 整合測試
npm run test:integration

# 回放測試
curl -X POST http://localhost:3000/api/verify/round-123 | jq
```

**交付物**
- Spin API（文檔 + 實作）
- 審計端點
- 壓力測試報告

---

### 測試（QA Engineer）

**Week 0-1：測試策略**
- 定義測試金字塔與左移計劃
- 建立 Schema 驗證測試套件
- 與 Math 設計確定性測試

**Week 2-3：單元與整合**
- 產出引擎單元測試案例
- 建立 API 契約測試
- CI 整合（自動化執行）

**Week 4-5：視覺回歸**
- 建立視覺回歸基線（Playwright）
- 關鍵畫面快照（10+ 場景）
- 與 FE 協作修正差異

**Week 6-8：合規與壓力**
- 回放測試（1000 rounds 位元級一致）
- 壓力測試（模擬高並發）
- 產出最終測試報告

**工具與指令**
```bash
# 執行所有測試
npm test

# 視覺回歸
npm run test:visual -- --update-snapshots

# 回放測試
node tests/replay-test.js --rounds 1000 --seed audit-2025

# 壓力測試
artillery run tests/load-test.yml
```

**交付物**
- 測試套件（自動化）
- 覆蓋率報告
- 視覺回歸基線
- 合規測試報告

---

## 五、立即行動清單（Today's Checklist）

### 🚀 今天就能開始（Day 0）

**企劃**
- [ ] 召開 30 分鐘 Kickoff，凍結目標：RTP=95%, Vol=30, MaxWin=5000x
- [ ] 建立風險登記簿 Google Sheet

**數值**
- [ ] 複製 `basic-slot.json` 為 `my-game.json` v0.1
- [ ] 跑基線模擬：`npm run cli -- simulate -s my-game.json --spins 10000`
- [ ] 將結果存為 `docs/baselines/week0.json`

**測試**
- [ ] 建立 PR 模板：`.github/PULL_REQUEST_TEMPLATE.md`
- [ ] 寫 1 個確定性測試：同 seed 必產生同 grid

**美術**
- [ ] 確認 `docs/asset-naming-guide.md` 存在
- [ ] 建立 `assets/manifest.json` 空白檔案

**前端/後端**
- [ ] Review 現有 CLI 代碼，理解規格驅動流程
- [ ] 建立開發分支：`git checkout -b feat/week0-setup`

### 📅 本週內完成（Day 1-5）

- [ ] CI Pipeline 骨架（至少 Lint + Validate）
- [ ] 規格 v0.1 通過 100k 模擬，RTP ±2%
- [ ] 任務看板建立，Sprint 1 卡片 Ready
- [ ] PSD 範本（3 符號 + 1 按鈕）完成
- [ ] 確定性測試套件 ≥ 5 cases

---

## 六、常見問題與解答（FAQ）

### Q1：AI Agent 是否必須？沒有 AI 能否執行？
**A：** 可以。AI Agent 是「加速器」，核心是 CLI 工具（validate/simulate/optimize）。沒有 AI，手動執行這些指令並解讀報告即可，只是效率較低。

### Q2：8 週（或 9 週）是否現實？
**A：** 針對 Base Game（無 Bonus）且團隊熟悉 SDD 模式，8 週可行。新團隊建議 10-12 週。

### Q3：前端與後端可否完全並行？
**A：** 可以。規格是契約，後端先 Mock API 給前端，待引擎完成後替換。關鍵是 API 契約（OpenAPI）要早期凍結。

### Q4：資產延期怎麼辦？
**A：** 使用佔位符資產（placeholder）先行開發與測試，資產完成後替換。manifest 架構先定義好。

### Q5：規格變更頻繁怎麼辦？
**A：** 採用「變更提案→影響評估→批次合併」流程，避免每日變更。Week 1-2 允許調整，Week 3 後凍結重大變更。

### Q6：如何處理多語系？
**A：** 在規格中增加 `i18n` 欄位，資產命名帶語言標記（`tx_logo_cn.png`）。FE 依 locale 載入對應資產。建議 Week 4-5 處理。

### Q7：視覺回歸測試成本高嗎？
**A：** 初期建立基線需 1-2 天，後續自動化。使用 Playwright 或 Percy，成本可控。

### Q8：如何確保 RTP 不漂移？
**A：** 每次規格變更必跑模擬（≥ 100k），上線後監控真實 RTP（每日計算）。漂移 > 2% 觸發告警。

---

## 七、總結與下一步

### 關鍵要點
1. **Week 0 不可跳過**：對齊目標、建立基線、設置 CI 是成功基礎
2. **規格是契約**：所有角色以規格為準，變更走 RFC 流程
3. **測試左移**：QA 從 Week 1 介入，不要等到 Week 7
4. **風險緩衝**：9 週排程（含 1 週緩衝）+ 檢查點機制
5. **AI 是工具**：核心是 CLI + 流程，AI 只是加速

### 立即下一步
1. **今天**：執行「立即行動清單」Day 0 項目
2. **本週**：完成 Week 0 所有交付物
3. **下週一**：Sprint 1 啟動會議，正式進入 Week 1

### 持續改進
- 每個 Sprint 回顧會議記錄改進項
- 更新此文檔，形成團隊知識庫
- 分享成功案例與失敗教訓

---

**文檔維護**：此文檔應隨專案進展持續更新，記錄實際遭遇的問題與解法。
