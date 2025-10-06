# Slot Game 規格驅動（SDD）+ AI Agent 輔助 完整開發計劃

## 文件資訊
- 專案名稱：規格驅動 + AI Agent 老虎機開發計劃
- 版本：v2.0（含規格範例、執行方式、里程碑與排程）
- 日期：2025-10-06
- 範圍：老虎機（Slot）遊戲從原型到上線的全流程，涵蓋美術、前端、後端、數值、測試與合規，並以 AI Agent 輔助落地
- 預計週期：8 週（雙週 Sprint）
- 目標產品：5x3 經典轉軸 Slot（Base Game）

---

## 1. 方案總覽與成功指標

### 1.1 核心理念
- SDD（Spec-Driven Development）以「規格檔（JSON/Schema）」作為單一真理來源（SSOT），所有角色依規格協作。
- AI Agent 作為「加速器」與「品質守門員」，對規格與產出進行建議、生成、驗證與監控。
- RNG、數學引擎保持確定性與可重現（Seeded RNG），便於測試、審計與合規。

### 1.2 產品目標與成功指標（KPI）
- 產品目標：於 8 週內交付具生產就緒品質的 5x3 Slot（Base Game，無複雜 Bonus）
- 成功指標：
  - **數學品質**：模擬 RTP 接近目標（±1%）且營運期間漂移 < 2%
  - **確定性**：同 seed → 同 grid 與 wins（引擎確定性）
  - **測試品質**：測試通過率 100%、覆蓋率 ≥ 80%
  - **效能**：首屏載入 < 2s（桌機），轉軸動畫 FPS ≥ 60
  - **合規**：審計可回放、規格可追溯（版本/seed/結果）
  - **開發效率**：相較傳統開發縮短 30-50% 週期

### 1.3 高階架構
```
             ┌───────────────────────────┐
             │    規格檔（JSON + Schema）  │
             │  單一真理來源（SSOT）       │
             └───────┬───────────┬───────┘
                     │           │
               ┌─────▼─────┐ ┌───▼──────────┐
               │ Engine/BE │ │   FE Renderer │
               │ Spin/RTP  │ │ Canvas/WebGL  │
               └─────┬─────┘ └───┬──────────┘
                     │           │
            ┌────────▼───────────▼─────────┐
            │      AI Agents 協作層         │
            │ Spec/Math/Asset/QA/Ops/BE/FE │
            └────────┬───────────┬─────────┘
                     │           │
             ┌───────▼──────┐ ┌──▼──────────┐
             │ Simulator    │ │ Optimizer    │
             │ Monte Carlo  │ │ Heuristic    │
             └──────────────┘ └──────────────┘
```

---

## 2. AI Agent 角色與職責

- **Spec Agent（規格代理）**
  - 從 GDD 生成初版規格；檢查規格一致性與完整性；提出平衡建議
  
- **Math Optimizer Agent（數學優化代理）**
  - 呼叫模擬器/優化器，搜尋 RTP/Vol 目標；產出比較報告
  
- **Asset Agent（資產代理）**
  - **核心職責**：
    - 根據規格 `symbols` 陣列生成完整資產清單（符號、背景、UI、音效）
    - 解析 PSD 結構（`psd_structure.json`），驗證圖層命名符合規範
    - 檢查資產檔名/尺寸/壓縮/透明度/格式
    - 生成 `assets/manifest.json`（資產索引與元數據）
    - 產出切圖自動化腳本（基於 PSD 圖層命名規則）
    - 提出資產優化建議（合圖、WebP 轉換、懶載入策略）
  - **輸入**：
    - 規格檔 `spec.json`（symbols、layout、多語系）
    - PSD 主檔案結構 JSON（`psd_structure.json`）
    - 資產規範文檔（尺寸/格式/命名規則）
  - **輸出**：
    - 資產清單 CSV/JSON（含檔名、用途、尺寸、狀態、語言）
    - 缺漏報告（哪些符號/狀態/語言缺資產）
    - 檢核報告（尺寸不符、檔名錯誤、壓縮未達標）
    - 切圖腳本（Photoshop JSX 或 CLI）
  
- **FE Agent（前端代理）**
  - 依規格生成 UI 骨架；提示效能最佳化；產出可視化測試場景
  
- **BE Agent（後端代理）**
  - 產生 API 標準樣板；檢查確定性與風險；產出審計端點建議
  
- **QA Agent（測試代理）**
  - 從規格生成測試案例（單元/整合/視覺/壓力）；監控覆蓋率
  
- **Ops Agent（營運代理）**
  - 監控 RTP 漂移；提出調整方案；輔助 A/B 測試決策

### Guardrails（安全欄）
- 重要變更需人工評審（PR Review + 測試全綠）
- RNG/數學邏輯不得外呼第三方黑箱服務
- 產出皆有可重現性（記錄 seed、版本、指令）
- **美術資產變更**：需視覺回歸測試通過 + 設計師簽核

---

## 3. 規格範例與執行方式

### 3.1 規格範例（JSON）
以下為簡化的 5x3 規格範例，完整版見 `src/specs/examples/basic-slot.json`：

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

**欄位說明**：
- `layout.reels/rows`：盤面尺寸（5x3）
- `reels`：每輪帶陣列（上→下順序），長度即為各輪帶停點數
- `paylines`：線路定義（[col,row] 座標陣列）
- `paytable`：每符號對應賠付（3/4/5 of a kind），wild 替代、scatter 全盤計算
- `bet.base`：基礎投注單位

### 3.2 執行方式（CLI 指令）

#### 驗證規格（Schema + 邏輯檢查）
```bash
npm run -s cli -- validate -s src/specs/examples/basic-slot.json
```
**輸出**：規格有效 or 錯誤訊息（繁中）

#### 單次旋轉（可帶 seed 再現）
```bash
npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo
```
**輸出**：Grid、中獎線與總贏分

#### 批量模擬（輸出 RTP/HitRate/Volatility）
```bash
# 快速測試（5,000 次）
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 5000

# 正式評估（100,000 次以上）
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 100000
```
**輸出**：RTP、HitRate、Volatility、MaxWin 等統計

#### 啟發式優化（接近目標 RTP/Vol）
```bash
npm run -s cli -- optimize -s src/specs/examples/basic-slot.json \
  --targetRTP 0.95 \
  --targetVol 30 \
  --spins 2000 \
  --iters 50
```
**輸出**：最佳候選規格與比較報告

#### VS Code 任務（已內建）
- 任務：`slot:simulate`（5000 次、seed=demo）
- 執行：`Ctrl+Shift+P` → `Tasks: Run Task` → `slot:simulate`

### 3.3 測試與驗證
```bash
# 執行所有測試
npm test

# 執行 Lint 檢查
npm run lint

# 執行建置
npm run build
```

---

---

## 4. 開發階段與各類別細節

### Phase 0：準備與基礎設施（Week 1）
- 輸入：團隊需求、平台標準、Schema、現有 CLI
- 工具：`zod`、`ts-jest`、`eslint`、CLI（validate/simulate/optimize）
- AI 任務：
  - 提供規格模板（依遊戲題材）
  - 建議 KPI 與驗收標準（RTP/Vol/Hitrate 範圍、效能/可用性目標）
- 驗收：
  - 專案可 build/test/lint；CLI 可用；README 完整

角色細節：
- 數值：確立目標 RTP/Vol 區間與風格（low/med/high）
- 前端：建 Canvas/WebGL 範本頁與資產載入管線
- 後端：建立 Spin API 骨架與審計紀錄表
- 測試：建立最小可行測試（引擎確定性、Schema Valid）
- 美術：建立資產風格指南與命名規範

---

### Phase 1：規格設計與驗證（SDD 核心）（Week 2）
- 輸入：GDD、參考機台、商業需求
- 任務：
  - Spec Agent 產出初版規格（reels/strips/symbols/paytable/paylines）
  - `npm run cli -- validate -s spec.json` 驗證格式
  - `npm run cli -- simulate -s spec.json --spins 100000` 快速估算
- AI 任務：
  - 生成 baseline 輪帶與賠付表（靠近目標 RTP）
  - 數據敏感度分析（提高/降低 Wild/Scatter 權重的影響）
- 驗收：
  - 模擬 RTP 在目標 ±2% 以內；命中率/波動度符合預期標籤
- 產出：
  - `specs/games/<name>.json`、初步模擬報告

角色細節：
- 數值：主責規格；與 Agent 協作微調
- 測試：檢查 Schema 與基本模擬結果
- 後端：審閱可行性（Spin 時間、審計欄位）

---

### Phase 2：引擎原型與前後端串接（Week 3-4）
- 輸入：通過 Phase 1 的規格
- 任務：
  - 後端：確保引擎確定性、Spin API、審計 log（seed、grid、wins）
  - 前端：渲染 5x3 盤面、動畫占位、基本 UI（下注、線數、旋轉）
  - `npm test`、`npm run cli -- spin` 驗證流程
- AI 任務：
  - 產出樣板測試、API 契約檢查、效能提示（避免 layout thrash）
- 驗收：
  - 單次 Spin 時間 < 10ms（本地）；FPS ≥ 60；API p95 < 100ms
- 產出：
  - 可互動 Demo、引擎與 UI 骨架

角色細節：
- 前端：Mock 與後端可切換；載入規格驅動 UI
- 後端：紀錄與回放機制（seed 驗證端點）
- 測試：確定性測試（同 seed 同結果）

---

### Phase 3：美術與內容整備（Week 5）
- 輸入：資產清單（由規格衍生）、PSD 主檔案結構
- 任務：
  - 美術製作符號/背景/UI/音效；命名與尺寸符合規範
  - 資產清單 `assets/manifest.json` 與壓縮優化
  - PSD 圖層結構標準化與切圖自動化
- AI 任務：
  - 資產檢查（檔名/尺寸/壓縮/透明度）報告；缺漏提示
  - 從 PSD 結構生成資產清單與切圖腳本
- 驗收：
  - 全資產載入成功；畫面/音效與規格一致；體積達標
  - PSD 圖層命名符合切圖規範；可自動化輸出

#### 角色細節：
##### 美術（Art）
**輸入**：
- 規格檔符號清單（symbols）
- 盤面尺寸（layout.reels × layout.rows）
- 多語系需求（cn/tw/en）
- 品牌風格指南

**輸出**：
- PSD 主檔案（標準化圖層結構）
- 切圖資產（PNG/WebP，含狀態變化）
- 資產清單 JSON（manifest）

**執行細節**：
1. **PSD 結構標準化**（參考 `psd_structure.json`）
   - 頂層群組分類：
     - `MG`（Main Game 主遊戲場景）
     - `FG`（Free Game 免費遊戲場景）
     - `sym`（符號圖層組，依規格 symbols 陣列）
     - `線圖`（Payline 中獎線圖層）
     - `UI 元件`（按鈕、資訊欄、彈窗等）
   
2. **命名規範**（自動化切圖必備）
   - **背景**：`bg_{context}.{ext}`
     - 範例：`bg_mg.jpg`、`bg_reel.png`、`bg_fg.jpg`
   - **符號**：`sym_{id}_{state}.png`
     - 範例：`sym_A_normal.png`、`sym_W_glow.png`
   - **按鈕**：`btn_{function}_{state}.png`
     - 範例：`btn_spin_up.png`、`btn_spin_hover.png`、`btn_spin_down.png`、`btn_spin_disable.png`
   - **文字/圖示**：`tx_{context}_{lang}_{state}.png` 或 `icon_{name}.png`
     - 範例：`tx_bfg_cn_up.png`、`icon_info.png`
   - **數字字體**：`num_{context}/{char}.png`
     - 範例：`num_win/0.png` ~ `num_win/9.png`、`num_win/comma.png`
   - **遮罩/特效**：`pic_{purpose}.png`
     - 範例：`pic_reel_mask.png`、`pic_light_ray.png`

3. **尺寸與規格**
   - **畫布基準**：1080 × 1920px（直式）或 1920 × 1080px（橫式）
   - **符號尺寸**：統一正方形或矩形（如 240×240px），保留 10% 留白邊界
   - **按鈕熱區**：最小 88×88px（行動裝置可點擊區）
   - **文字安全區**：距邊界 ≥ 40px
   - **輸出格式**：
     - 背景/不透明元件：JPG（品質 85-90）
     - 透明/動效元件：PNG-24 或 WebP（Alpha）
     - 壓縮後單檔 ≤ 200KB（背景可至 500KB）

4. **狀態變化管理**
   - 按鈕四態：`up`（常態）、`hover`（懸停）、`down`（按下）、`disable`（禁用）
   - 符號動效：`normal`（靜態）、`glow`（中獎發光）、`blur`（轉動模糊，選配）
   - 多語系：`cn`（簡中）、`tw`（繁中）、`en`（英文），圖層名稱與檔名一致

5. **圖層組織最佳實踐**
   - 使用群組（Group）分類功能區塊
   - 預覽用圖層標記「預覽」，輸出用圖層標記「出圖」
   - 定位參考圖層標記「定位」（不輸出）
   - 使用遮色片（Mask）而非圖層刪除
   - 混合模式（Blend Mode）需註記（如 `linear dodge`）

##### 前端（FE）
- **資產載入策略**：
  - **Preload**（首屏必需）：Logo、主背景、常用符號、Spin 按鈕
  - **Lazy Load**（延遲載入）：彈窗資產、賠付表圖片、音效
  - 使用 Sprite Atlas（合圖）減少 HTTP 請求
- **資產快取**：Service Worker 或 IndexedDB
- **動態替換**：多語系資產依 locale 切換

##### 測試（QA）
- **視覺回歸**：
  - 使用 Percy、Chromatic 或 Playwright 快照比對
  - 關鍵畫面（主畫面、中獎、彈窗）必測
- **資產檢核**：
  - 檔名符合命名規範
  - 尺寸符合規格（容差 ±5px）
  - 壓縮率達標（總包 < 10MB）
  - 透明度正確（無意外白邊/黑邊）
- **音量基準**：峰值 ≤ -6dB、平均 -18dB

---

### Phase 4：數值調參與 A/B 測試（Week 6）
- 輸入：已可玩的遊戲與規格
- 任務：
  - `npm run cli -- optimize -s spec.json --targetRTP 0.95 --iters 50`
  - 產生多個變體規格（variant A/B/C）
  - 大樣本模擬（≥ 1,000,000 spins）估算區間
- AI 任務：
  - 搜尋建議（調整 strip 次序/密度、paytable 倍率）
  - 生成比較報告（RTP/Vol/HitRate/MaxWin 分佈）
- 驗收：
  - 變體落在監管允許區間；風格符合產品策略

角色細節：
- 數值：設定目標函數與約束（MaxWin、尖鋭度）
- 後端：確保變體規格熱更新或灰度釋出
- 測試：比對變體結果顯著性（統計檢定可選）

---

### Phase 5：整合測試與穩定性（Week 7）
- 任務：
  - 單元/整合/E2E/視覺/壓力測試齊備
  - 錯誤追蹤（Sentry/自有）與記錄標準化
- AI 任務：
  - 從規格生成更多覆蓋場景（邊界、極值）
  - 偵測 flaky 測試並提出修正建議
- 驗收：
  - 覆蓋率 ≥ 80%；E2E 穩定；壓力測試通過

角色細節：
- 測試：持續整合 pipeline 守門
- 前端：視覺回歸穩定；效能回歸基線
- 後端：資安與風險測試（注入/速率限制）

---

### Phase 6：合規、審計與上線（Week 8）
- 任務：
  - 生成數學報告（RTP、PAR、MaxWin）、審計材料（seed 回放）
  - 上線流程與回滾策略
- AI 任務：
  - 合規清單自查；文件補全提示
- 驗收：
  - 法遵文件齊備；回放機制驗證一致

角色細節：
- 後端：暴露 `/api/verify/:roundId` 驗證端點
- 測試：隨機抽樣回放比對 JSON（位元級一致）

---

### Phase 7：營運與持續優化（Post-Launch）
- 任務：
  - 監控真實 RTP 與模擬差距；異常告警
  - 設計賽季或活動規格變體
- AI 任務：
  - 漂移偵測；提出規格調整建議；預估影響
- 驗收：
  - 達成營運 KPI；玩家留存/付費指標健康

角色細節：
- Ops：灰度與 A/B；資料觀測（DataDog/Grafana）
- 數值：與產品一起迭代規格

---

## 5. 里程碑與排程（8 週雙週 Sprint）

### 里程碑摘要
- **M0 啟動**（週 1）：環境就緒、Schema/CLI/測試基線、AI 任務看板
- **M1 規格 v1**（週 2）：初版規格接近目標 RTP（±2%）
- **M2 原型**（週 4）：Spin API、前端可視化播放、確定性測試通過
- **M3 內容整備**（週 5）：資產清單與載入策略、UI 骨架穩定
- **M4 數值平衡**（週 6）：優化至目標 RTP（±1%）、風險評估
- **M5 整合測試**（週 7）：覆蓋率 ≥ 80%、效能基線建立
- **M6 合規審計**（週 8）：審計回放、合規文件清單、發佈準備

### 詳細排程（RACI 矩陣）

| 週次 | 里程碑 | 主要任務 | 輸出 / 交付物 | 責任人（R）| 批准人（A）| 協商（C）| 知會（I）|
|-----|-------|---------|-------------|----------|----------|---------|---------|
| **Week 1** | M0 啟動 | 專案初始化<br>測試基線建立<br>AI Agent 看板<br>規格模板準備 | - Build/Lint/Test 通過<br>- AI Backlog 文檔<br>- 規格模板 | TL, QA | PM | All | Stakeholders |
| **Week 2** | M1 規格 v1 | 規格初版設計<br>基本模擬驗證<br>RTP 初估 | - spec.json v1<br>- 模擬報告（RTP ±2%）<br>- 驗證通過 | 數值 | TL | Math Agent, QA | PM, 前端, 後端 |
| **Week 3** | M2 原型（1/2）| BE Spin API 開發<br>確定性測試<br>審計 log 設計 | - Spin API endpoint<br>- 確定性測試通過<br>- Seed 回放機制 | 後端 | TL | BE Agent, QA | 前端, 數值 |
| **Week 4** | M2 原型（2/2）| FE 回合播放<br>資產載入管線<br>UI 骨架 | - 可視化 Demo<br>- 動畫播放<br>- FPS ≥ 60 | 前端 | TL | FE Agent, 美術 | 後端, QA |
| **Week 5** | M3 內容 | 資產清單與製作<br>命名/壓縮檢核<br>載入策略優化 | - assets/manifest.json<br>- 資產交付<br>- 載入策略文檔 | 美術 | TL | Asset Agent, 前端 | QA |
| **Week 6** | M4 平衡 | 啟發式優化<br>A/B 變體設計<br>風險評估 | - 最佳候選 spec<br>- 變體規格（A/B/C）<br>- 風險矩陣 | 數值 | PM | Math Agent, Ops | 後端, QA |
| **Week 7** | M5 整測 | 覆蓋率提升<br>效能基線<br>E2E 穩定性 | - 測試報告（≥ 80%）<br>- 效能報表<br>- E2E 通過 | QA | TL | QA Agent, 前端, 後端 | All |
| **Week 8** | M6 合規 | 審計回放端點<br>合規 checklist<br>發佈準備 | - /api/verify 端點<br>- 合規文件<br>- 上線 Runbook | 後端, Ops | PM | BE Agent, QA | All |
| **Post** | M7 營運 | RTP 漂移監控<br>持續優化<br>A/B 測試 | - 監控儀表板<br>- 優化建議<br>- 營運報告 | Ops, 數值 | PM | Ops Agent, Math Agent | All |

### 關鍵路徑（Critical Path）
1. **Week 1-2**：規格設計是所有後續工作的基礎，必須優先完成
2. **Week 3-4**：引擎與 UI 原型並行，確保確定性與可玩性
3. **Week 5-6**：資產與數值平衡同步，避免後期大改
4. **Week 7-8**：測試與合規串行，確保品質門檻

### 風險緩衝（Buffer）
- 每個 Phase 預留 10-15% 時間緩衝
- Week 4 與 Week 7 為檢查點，可調整排程

---

## 6. 驗收標準（Definition of Done）

### 技術驗收
- ✅ **Schema 驗證**：規格通過 Zod 驗證；錯誤訊息可讀（繁中）
- ✅ **確定性**：同一 seed 下，grid/wins 完全一致；回放端點位元級一致
- ✅ **數學品質**：模擬 100k 次，RTP 偏差 ≤ 1%，HitRate/Vol 落在定義區間
- ✅ **測試覆蓋**：單元/整合/E2E 全綠，覆蓋率 ≥ 80%
- ✅ **效能**：首屏 < 2s、動畫 FPS ≥ 60（桌機）；性能回歸監控已接入
- ✅ **資產品質**：命名/尺寸/壓縮符合檢核；資產清單與規格一致

### 業務驗收
- ✅ **產品體驗**：UI/UX 符合設計稿；互動流暢；音效同步
- ✅ **合規**：RNG 認證、審計文件、PAR Sheet 齊備
- ✅ **文檔**：規格版本化、變更紀錄、API 文檔、運維手冊完整

---
- 以現有 CLI 流程為核心：
  - `validate` → 規格合法
  - `simulate` → 數學估算
  - `optimize` → 調參建議
- CI 建議步驟：
  - Lint/Typecheck → Schema Validate → Unit/E2E → 模擬快跑（樣本小） → 報告產出
- 日誌與可追溯性：
  - 版本、seed、規格、CLI 指令、結果寫入審計表

---

## 7. 工具鏈與自動化
- 以現有 CLI 流程為核心：
  - `validate` → 規格合法性檢查
  - `simulate` → 數學估算與統計
  - `optimize` → 調參建議與優化
- CI/CD 建議步驟：
  ```yaml
  # .github/workflows/ci.yml（範例）
  - Lint/Typecheck
  - Schema Validate
  - Unit Tests
  - E2E Tests
  - Simulate（小樣本快跑）
  - 報告產出與存檔
  ```
- 日誌與可追溯性：
  - 版本、seed、規格、CLI 指令、結果寫入審計表
  - 每次部署記錄規格快照（Git Tag + Artifact）

---

## 8. 產出物與交付清單

### 必要交付物
1. **規格檔**：`src/specs/examples/basic-slot.json`（版本化）
2. **報告**：
   - 模擬報告（RTP/HitRate/Vol）
   - 優化比較報告
   - 風險矩陣
   - 效能基線報告
   - 測試報告（覆蓋率/通過率）
3. **合約**：
   - Spin API 規格
   - 審計回放 API 規格
   - 資產清單與載入策略文檔
4. **自動化**：
   - CLI 指令與使用文檔
   - VS Code 任務配置
   - CI/CD Pipeline 配置

### 選配交付物
- 規格可視化編輯器
- 變體管理與 A/B 平台
- 監控儀表板（Grafana/DataDog）

---
- Spec Agent Prompt 要點：
  - 輸入：題材、目標 RTP/Vol、盤面大小
  - 產出：合法 JSON 規格；敏感度分析摘要
- Optimizer Agent Prompt 要點：
  - 目標函數：|RTP-Target| + λ|Vol-Target|
  - 約束：MaxWin、HitRate 區間、符號稀疏度上下限
- QA Agent Prompt 要點：
  - 從規格列舉邊界條件，產出對應測試案例與期望值

---

## 9. AI Agent Prompt 與驗收模版（節選）

### Spec Agent Prompt 要點
- **輸入**：題材、目標 RTP/Vol、盤面大小、符號設計
- **產出**：合法 JSON 規格；敏感度分析摘要
- **驗收**：通過 Schema 驗證；模擬 RTP 在目標 ±2%

### Math Optimizer Agent Prompt 要點
- **目標函數**：`|RTP-Target| + λ|Vol-Target|`
- **約束**：MaxWin 上限、HitRate 區間、符號稀疏度範圍
- **產出**：最佳候選規格；比較報告（變體 A/B/C）

### QA Agent Prompt 要點
- **輸入**：規格檔與引擎 API
- **任務**：從規格列舉邊界條件，產出測試案例與期望值
- **產出**：自動化測試腳本；覆蓋率報告

### Asset Agent Prompt 要點
- **輸入**：規格符號清單
- **任務**：檢查資產命名/尺寸/壓縮；產出缺漏報告
- **產出**：`assets/manifest.json`；優化建議

---

## 10. 風險與緩解

### 技術風險
| 風險 | 影響 | 機率 | 緩解措施 |
|-----|-----|-----|---------|
| RTP 偏差大 | 高 | 中 | 提高模擬樣本量；多目標優化；限制極端賠付 |
| 規格/程式漂移 | 中 | 高 | CI 驗證規格快照；強制 PR 檢查 |
| 效能退化 | 中 | 中 | 建立性能基線與告警；資產分級載入 |
| AI 產出錯誤 | 高 | 低 | 強制人工審核門檻；測試全綠才合併 |

### 業務風險
| 風險 | 影響 | 機率 | 緩解措施 |
|-----|-----|-----|---------|
| 合規延遲 | 高 | 低 | 提前準備 RNG 認證；審計文檔模板化 |
| 資產延期 | 中 | 中 | 提前凍結規格；使用佔位資產並行開發 |
| 需求變更 | 中 | 高 | 規格版本控制；影響面分析與排期調整 |

---

## 11. 附錄 A：命令速查表

```bash
# 驗證規格
npm run -s cli -- validate -s src/specs/examples/basic-slot.json

# 單次旋轉（帶 seed）
npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo

# 批量模擬（快速）
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 5000

# 批量模擬（正式評估）
npm run -s cli -- simulate -s src/specs/examples/basic-slot.json --spins 100000

# 啟發式優化
npm run -s cli -- optimize -s src/specs/examples/basic-slot.json \
  --targetRTP 0.95 --targetVol 30 --spins 2000 --iters 50

# 執行測試
npm test

# 執行 Lint
npm run lint

# 建置專案
npm run build
```

---

## 12. 附錄 B：規格欄位備忘錄

| 欄位 | 說明 | 範例 |
|-----|-----|-----|
| `name` | 遊戲名稱 | `"Basic 5x3 Demo"` |
| `layout.reels` | 輪數 | `5` |
| `layout.rows` | 每輪顯示行數 | `3` |
| `bet.base` | 基礎投注單位 | `1` |
| `symbols` | 符號清單 | `["A","K","Q","W","S"]` |
| `reels` | 各輪帶陣列（上→下） | `[["A","K",...], ...]` |
| `paylines` | 線路座標定義 | `[[[0,0],[1,1],...], ...]` |
| `paytable` | 賠付表 | `{"A": {"3": 5, "4": 20}}` |
| `paytable.*.substitute` | Wild 替代設定 | `true` |
| `paytable.*.scatter` | Scatter 全盤計算 | `{"3": 2, "4": 10}` |

---

## 13. 附錄 C：美術資產管理規範

### C.1 PSD 主檔案結構標準

基於實際專案 PSD 結構（`psd_structure.json`，畫布 1080×1920px），建議採用以下圖層組織：

#### 頂層群組分類
```
根目錄/
├── MG（Main Game 主遊戲）
│   ├── bg_mg.jpg（主背景）
│   ├── 陽光特效（光線特效，blend: linear dodge）
│   ├── 購買免費遊戲入口/（BFG 按鈕組）
│   │   ├── up/
│   │   ├── hover/
│   │   ├── down/
│   │   └── disable/
│   └── 主操作區/（下注、旋轉、設定按鈕）
├── FG（Free Game 免費遊戲場景）
│   ├── bg_fg.jpg（FG 背景）
│   └── num_remaining/（剩餘次數數字）
├── bg_reel.png（轉軸背景/框架）
├── sym定位/（符號定位參考，不輸出）
├── sym/（符號圖層，依規格 symbols）
│   ├── m2.png（高級符號）
│   ├── m1.png
│   ├── h1.png（中級符號）
│   ├── l1.png（低級符號）
│   ├── W.png（Wild）
│   └── S.png（Scatter）
├── 線圖/（Payline 中獎線動效）
├── tx_logo_{lang}.png（Logo 多語系）
├── 賠附表/（Paytable 彈窗）
├── 可用分數_餘額_btn_credits/
├── 下注分數_總投注_btn_info_bet/
├── 得分提示/（Win 顯示）
├── 局號/（Round ID）
├── 固定公版/（通用 UI，如設定/說明/返回）
├── 購買免費遊戲彈窗/
├── gamble/（選配：賭倍功能）
├── pic_reel_mask.png（轉軸遮罩）
├── 轉場動態延伸/
└── loading頁/
```

### C.2 資產命名規範對照表

| 類別 | 命名格式 | 範例 | 狀態/變體 |
|-----|---------|-----|----------|
| **背景** | `bg_{context}.{ext}` | `bg_mg.jpg`<br>`bg_reel.png`<br>`bg_fg.jpg` | 主場景/轉軸/免費遊戲 |
| **符號** | `sym_{id}_{state}.png` | `sym_A_normal.png`<br>`sym_W_glow.png` | normal / glow / blur |
| **按鈕** | `btn_{function}_{state}.png` | `btn_spin_up.png`<br>`btn_spin_hover.png`<br>`btn_spin_down.png`<br>`btn_spin_disable.png` | up / hover / down / disable |
| **文字圖** | `tx_{context}_{lang}_{state}.png` | `tx_bfg_cn_up.png`<br>`tx_logo_tw.png` | 多語系 cn/tw/en |
| **圖示** | `icon_{name}.png` | `icon_info.png`<br>`icon_settings.png` | — |
| **數字字** | `num_{context}/{char}.png` | `num_win/0.png`<br>`num_win/comma.png`<br>`num_bfg_up/9.png` | 依用途分資料夾 |
| **遮罩/特效** | `pic_{purpose}.png` | `pic_reel_mask.png`<br>`pic_light_ray.png` | — |
| **線圖** | `line_{id}_{state}.png` | `line_01_active.png`<br>`line_05_inactive.png` | active / inactive |

### C.3 尺寸與技術規格

| 項目 | 規範 | 說明 |
|-----|-----|-----|
| **畫布尺寸** | 1080×1920px（直式）<br>1920×1080px（橫式） | 依平台調整 |
| **符號尺寸** | 240×240px（含 10% 留白） | 統一正方形，實際圖形 216×216px |
| **按鈕最小尺寸** | 88×88px | 行動裝置可點擊最小熱區 |
| **文字安全區** | 距邊界 ≥ 40px | 避免系統 UI 遮擋 |
| **輸出格式** | JPG（背景，品質 85-90）<br>PNG-24（透明元件）<br>WebP（選配，Alpha） | — |
| **單檔大小** | 背景 ≤ 500KB<br>其他 ≤ 200KB | 壓縮後 |
| **總包大小** | 首屏 < 3MB<br>完整 < 10MB | 含音效 |

### C.4 狀態變化管理

#### 按鈕四態
- **up**（常態/預設）：正常顯示
- **hover**（懸停）：滑鼠移入或觸控反饋，通常放大 110% + 發光
- **down**（按下）：點擊瞬間，通常縮小 90% + 變暗
- **disable**（禁用）：不可點擊，灰階或半透明（opacity 50%）

#### 符號動效
- **normal**：靜態顯示
- **glow**：中獎發光（可用 blend mode: linear dodge）
- **blur**（選配）：轉動時模糊效果

#### 多語系資產
- **cn**（簡體中文）、**tw**（繁體中文）、**en**（English）
- 檔名含語言標記：`tx_bfg_cn_up.png`、`tx_logo_tw.png`
- PSD 圖層分組：`tx_bfg_cn_up.png/`、`tx_bfg_tw_up.png/`、`tx_bfg_en_up.png/`

### C.5 自動化切圖流程

#### 工具選項
1. **Photoshop Generator**（推薦）
   - 圖層命名後綴：`bg_mg.jpg`、`sym_A_normal.png`
   - 自動輸出至 `assets/` 資料夾
   
2. **CLI 工具**
   - `psd-cli`：Node.js 解析 PSD
   - `imagemagick`：批次轉換與壓縮
   
3. **自定義腳本**
   - 解析 `psd_structure.json`
   - 依命名規則過濾圖層
   - 批次輸出與後處理

#### 範例腳本（概念）
```bash
# 從 PSD JSON 提取符號圖層
jq '.[] | select(.name == "sym") | .children[] | .name' psd_structure.json

# 批次壓縮 PNG
pngquant --quality=65-80 --ext .png --force assets/sym_*.png

# 轉換為 WebP
for f in assets/sym_*.png; do
  cwebp -q 80 "$f" -o "${f%.png}.webp"
done
```

### C.6 Asset Agent 檢核清單

AI Asset Agent 應自動執行以下檢查：

#### 完整性檢查
- [ ] 規格 `symbols` 陣列中的每個符號是否有對應圖層？
- [ ] 多語系資產（cn/tw/en）是否齊全？
- [ ] 按鈕四態（up/hover/down/disable）是否完整？
- [ ] 數字字體 0-9 及符號（comma/point）是否齊全？

#### 命名規範檢查
- [ ] 檔名是否符合 `{category}_{context}_{state}.{ext}` 格式？
- [ ] 語言標記（cn/tw/en）是否正確？
- [ ] 狀態標記（up/hover/down/disable/normal/glow）是否一致？

#### 技術規格檢查
- [ ] 符號尺寸是否為 240×240px（±5px 容差）？
- [ ] 按鈕尺寸是否 ≥ 88×88px？
- [ ] 背景 JPG 品質是否 85-90？
- [ ] PNG 是否使用 PNG-24（Alpha）？
- [ ] 單檔大小是否符合限制（背景 ≤ 500KB，其他 ≤ 200KB）？

#### 視覺品質檢查
- [ ] 透明 PNG 是否有意外白邊/黑邊？
- [ ] 遮色片（mask）是否正確應用？
- [ ] Blend mode（如 linear dodge）是否記錄於 manifest？

### C.7 assets/manifest.json 結構範例

```json
{
  "version": "1.0.0",
  "canvas": { "width": 1080, "height": 1920 },
  "symbols": [
    {
      "id": "A",
      "states": {
        "normal": { "path": "sym_A_normal.png", "size": [240, 240] },
        "glow": { "path": "sym_A_glow.png", "size": [240, 240], "blend": "linear-dodge" }
      }
    },
    {
      "id": "W",
      "type": "wild",
      "states": {
        "normal": { "path": "sym_W_normal.png", "size": [240, 240] }
      }
    }
  ],
  "backgrounds": [
    { "context": "mg", "path": "bg_mg.jpg", "size": [1080, 1920], "preload": true },
    { "context": "reel", "path": "bg_reel.png", "size": [1496, 960], "preload": true }
  ],
  "buttons": [
    {
      "function": "spin",
      "states": {
        "up": { "path": "btn_spin_up.png", "hotspot": [88, 88] },
        "hover": { "path": "btn_spin_hover.png", "scale": 1.1 },
        "down": { "path": "btn_spin_down.png", "scale": 0.9 },
        "disable": { "path": "btn_spin_disable.png", "opacity": 0.5 }
      }
    }
  ],
  "i18n": {
    "logo": {
      "cn": "tx_logo_cn.png",
      "tw": "tx_logo_tw.png",
      "en": "tx_logo_en.png"
    }
  },
  "fonts": {
    "win": {
      "glyphs": ["0","1","2","3","4","5","6","7","8","9","comma","point"],
      "basePath": "num_win/"
    }
  }
}
```

---

## 14. 附錄 D：參考資料

- 現有專案位址與 CLI 用法：參考 `README.md`
- AI Agent 任務拆解：參考 `docs/AI-Agent-任務待辦清單-範例遊戲.md`
- 完整規格範例：`src/specs/examples/basic-slot.json`
- 未來擴充計劃：
  - 規格可視化編輯器（拖拉式設計）
  - 變體管理與 A/B 平台（灰度發布）
  - 更高階優化演算法（Bayesian/Evolutionary Strategies）

---

**本計劃已與現有專案指令、範例與 AI Agent 看板對齊，可直接依「里程碑與排程」展開執行。**
