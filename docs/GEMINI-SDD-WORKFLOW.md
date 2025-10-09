# AI 輔助的規格驅動 Slot Math 工作流程

## 1. 總覽 (Overview)

本文件概述了使用規格驅動開發 (Spec-Driven Development, SDD) 方法，並由 Gemini API 輔助設計 Slot Game 數學模型的工作流程。此流程的核心是一個 `math_spec.json` 檔案，它將作為遊戲數學設計的唯一真理來源 (Single Source of Truth)。

## 2. 核心理念 (Core Philosophy)

- **規格即真理 (Spec as Truth):** 所有數學設計（滾輪、賠付表、特殊玩法）都必須在 `math_spec.json` 中明確定義。程式碼（例如模擬器）只是此規格的實現，任何修改都應從規格開始。
- **AI 輔助設計 (AI-Assisted Design):** 利用 Gemini API 將自然語言的需求（例如「我想要一個高波動率的遊戲」）轉換為精確的數學規格。開發者是最終決策者，AI 是高效的設計夥伴。
- **快速迭代驗證 (Rapid Iterative Verification):** 透過「`規格 -> 模擬 -> 分析 -> 調整規格`」的閉環，我們可以在數分鐘內完成一次完整的數學模型調整與驗證。

## 3. 專案產出物 (Project Deliverables)

1.  **遊戲數學規格檔案 (`math_spec.json`):**
    一個結構清晰的 JSON 檔案，完整定義遊戲的所有數學細節。
    ```json
    {
      "gameInfo": {
        "gameName": "Gemini's Treasure",
        "reels": 5,
        "rows": 3,
        "paylines": 20,
        "targetRTP": 0.96,
        "targetVolatility": "Medium"
      },
      "symbols": {
        "H1": { "name": "Gem", "isWild": false },
        "L1": { "name": "Ace", "isWild": false },
        "WILD": { "name": "Wild", "isWild": true },
        "SCATTER": { "name": "Scatter", "isScatter": true }
      },
      "reels": [
        ["H1", "L1", "WILD"],
        ["H2", "SCATTER", "L1"]
      ],
      "paytable": {
        "H1": [0, 0, 10, 50, 200],
        "H2": [0, 0, 8, 40, 150]
      },
      "features": {
        "freeSpins": {
          "trigger": {
            "symbol": "SCATTER",
            "threshold": 3
          },
          "spinsAwarded": 10
        }
      }
    }
    ```

2.  **數學模擬腳本 (`run_simulation.ts`):**
    一個 TypeScript 腳本，能動態讀取 `math_spec.json` 檔案，並根據其內容執行蒙地卡羅模擬。

3.  **模擬分析報告 (`simulation_report.md`):**
    由 Gemini API 生成的 Markdown 格式報告，包含模擬結果的關鍵數據（實際 RTP、波動率指數、命中率等）與分析建議。

## 4. 開發流程 (Development Workflow)

### Phase 0: 環境設定 (Environment Setup)
- 在專案中建立一個新目錄，例如 `specs/slot_game_1/`，用於存放本次專案的所有產出物。

### Phase 1: 規格定義 (Specification Definition)
1.  **使用者提供需求:** 使用者用自然語言描述 `gameInfo` 中的核心規格。
2.  **Gemini 生成初步規格:** Gemini 建立 `math_spec.json` 的初始版本，包含 `gameInfo` 和 `symbols` 部分。

### Phase 2: 數學模型生成 (Math Model Generation)
1.  **Gemini 設計滾輪與賠付表:** 基於 `gameInfo` 中的規格，Gemini 計算並生成 `reels` 和 `paytable` 的具體內容，並更新 `math_spec.json`。
2.  **使用者審核與調整:** 使用者審核設計，並提出修改意見。
3.  **Gemini 更新規格:** Gemini 根據回饋更新 `math_spec.json`。

### Phase 3: 模擬程式碼生成 (Simulation Code Generation)
1.  **Gemini 讀取規格:** Gemini 讀取 `math_spec.json` 的最終版本。
2.  **Gemini 生成程式碼:** Gemini 撰寫 `run_simulation.ts`。此腳本的邏輯完全由規格驅動。

### Phase 4: 執行與分析 (Execution & Analysis)
1.  **使用者執行模擬:** 使用者透過 `ts-node` 或類似工具執行模擬腳本。
    ```bash
    npx ts-node specs/slot_game_1/run_simulation.ts --spins=100000000
    ```
2.  **使用者提供結果:** 使用者將模擬腳e本產生的原始數據貼給 Gemini。
3.  **Gemini 生成報告:** Gemini 分析數據，產出 `simulation_report.md`，並與 `math_spec.json` 中的目標進行比較。

### Phase 5: 迭代與優化 (Iteration & Refinement)
1.  **Gemini 提出建議:** 如果模擬結果與目標有偏差，Gemini 會在報告中提出具體的調整建議。
2.  **循環:** 根據建議，回到 **Phase 2** 調整規格，然後重新執行 Phase 3 和 4，直到所有指標達標。

## 流程擴展：從競品分析啟動開發 (Workflow Extension: Starting from Competitor Analysis)

除了從零開始定義需求，我們也可以採用更具市場競爭力的數據驅動方法：**逆向分析 (Reverse-Engineering)** 現有競品的遊戲數據，從中獲取洞見，並以此為基礎設計新的遊戲規格。

此流程特別適用於當我們擁有競品遊戲的詳細轉動日誌 (Spin Logs) 時，無論其格式是 CSV 檔案或是資料庫紀錄。

### 階段一：競品分析 (Competitor Analysis)

1.  **數據源識別與遊戲判定 (Data Source Identification & Game Profiling):**
    *   **目標:** 確定分析對象。
    *   **方法:** 根據數據來源的命名（例如檔案名 `tb_pg_fr_v2_002_0811.csv` 或資料庫表名 `tb_pg_wild_bounty_v1_004`），推斷出遊戲供應商（如 `pg` -> PG Soft）和具體遊戲（如 `Wild Bounty Showdown`）。

2.  **數據提取 (Data Extraction):**
    *   **目標:** 獲取完整的遊戲紀錄以供分析。
    *   **方法:**
        *   **檔案:** 直接讀取 CSV 或其他格式的日誌檔案。
        *   **資料庫:** 提供必要的連接憑證 (主機、端口、資料庫名、用戶名、密碼)，讓 Gemini 連接 PostgreSQL, MySQL 或其他資料庫，並查詢目標 Table 的數據。

3.  **數據分析與模型描繪 (Data Analysis & Model Profiling):**
    *   **目標:** 將原始數據轉化為可量化的數學指標，描繪出遊戲的核心數學畫像。
    *   **方法:** 執行腳本分析全部轉動紀錄，計算以下關鍵指標：
        *   **RTP (Return to Player - 玩家回報率):** `總贏分 / 總下注額`。
        *   **Hit Rate (命中率):** `總贏獎次數 / 總轉動次數`。
        *   **Volatility (波動率):** 分析贏分的分佈情況，判斷遊戲屬於高、中、低波動。
        *   **Feature Analysis (特色玩法分析):**
            *   **觸發頻率:** 平均多少次基礎遊戲會觸發一次免費遊戲 (Free Game) 或其他 Bonus。
            *   **平均收益:** 計算特色玩法的平均贏分倍數（相對於總押注）。
            *   **收益佔比:** 分析特色玩法的贏分佔遊戲總贏分的比例。

### 階段二：新遊戲規格設計 (New Game Specification)

在對競品有深入的數據洞察後，Gemini 可以輔助設計一款既能與之匹敵，又具備創新亮點的新遊戲規格 (`math_spec.json`)。

1.  **主題與核心機制創新 (Theme & Core Mechanic Innovation):**
    *   保留競品成功的核心機制（如串聯消除），但加入新的變化以創造差異化（例如，倍數在空轉後不清零）。
    *   選擇一個市場歡迎但視覺風格不同的新主題（例如，將西部牛仔主題改為「太空海盜」）。

2.  **數學模型定義 (Mathematical Model Definition):**
    *   基於競品數據，為新遊戲設定更具競爭力的數學目標（如，目標 RTP 設為 96.5%，波動率從「高」調整為「非常高」）。

3.  **特色玩法設計 (Feature Design):**
    *   設計全新的免費遊戲機制。例如，如果競品是固定倍數，新設計可改為「累進倍數」或「隨機倍數 Wild」。

4.  **賠付表規劃 (Pay Table Planning):**
    *   根據新的數學模型和波動率目標，設計一套全新的高、中、低賠付圖標及其賠率。

這個由數據驅動的流程，讓我們不是憑空想像，而是站在市場上已驗證成功的產品基礎上進行創新，從而顯著提高新遊戲的成功機率。

## 5. Gemini API 在此流程中的角色

- **需求翻譯器:** 將自然語言需求轉化為結構化的 `math_spec.json`。
- **數學設計師:** 負責繁瑣的滾輪和賠付表計算與平衡。
- **程式碼生成器:** 根據規格自動生成驗證用的模擬腳本。
- **數據分析師:** 解讀模擬結果，提供清晰的報告和可執行的優化建議。
- **創意夥伴:** 根據需求建議新的特殊玩法或數學機制。