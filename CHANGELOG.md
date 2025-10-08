# 變更日誌（Changelog）

本檔案記錄專案中所有重要的變更，遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 規範。

版本號遵循 [語意化版本 2.0.0](https://semver.org/lang/zh-TW/)。

---

## [Unreleased]

### 新增（Added）

- �️ **PostgreSQL 專案索引資料表 (project_index)** (2025-10-08)
  - **完整的 Slot 遊戲專案管理資料表**
  - 資料表結構：
    - **48 個欄位** 涵蓋所有遊戲資訊
    - **13 個索引** 優化查詢效能（含 GIN 全文搜尋）
    - **5 個 JSONB 欄位** 提供彈性擴展
  - 核心欄位分類：
    - 🎮 基本資訊（6）：game_id, game_name_en, game_name_cn, search_key, description
    - 🎰 Slot 特性（14）：reel_count, payline_count, rtp, volatility, has_free_spin, has_wild, has_scatter, has_multiplier, max_win_multiplier 等
    - 🖼️ 資產路徑（5）：thumbnail_url, banner_url, preview_video_url, asset_folder_path, psd_file_path
    - 📈 開發管理（5）：dev_status, dev_progress, release_version, release_date, dev_team
    - 💻 技術規格（4）：platform_support, screen_orientation, supported_languages, tech_stack
    - 📦 JSONB 資料（5）：features, symbols, paytable, game_config, metadata
    - 🏷️ 分類標籤（3）：tags, category, owner_id
    - ⚙️ 系統欄位（6）：created_at, updated_at, deleted_at, sort_order, is_active, is_featured
  - 索引策略：
    - 唯一索引：game_id（確保不重複）
    - 一般索引：game_name_en, game_name_cn, game_type, dev_status, category, is_active, sort_order, owner_id
    - GIN 索引：search_key（全文搜尋）、tags, features, metadata（JSONB 查詢）
  - 新增檔案：
    - `server/config/table.config.ts` - 新增 project_index 定義
    - `server/database/project-index-examples.ts` - 10 個完整使用範例
    - `docs/project-index-guide.md` - 完整使用指南（約 800 行）
    - `docs/project-index-quickref.md` - 快速參考文件
    - `docs/project-index-complete.md` - 完成總結報告
  - npm 腳本：
    - `npm run db:project-index-examples` - 執行範例程式
  - 功能特色：
    - ✅ 類型安全：TypeScript + ColumnType 枚舉
    - ✅ 自動生成：SQL 自動生成器支援
    - ✅ 資料驗證：必填欄位和資料型別檢查
    - ✅ 高效能：GIN 索引支援全文搜尋和 JSONB 查詢
    - ✅ 彈性擴展：JSONB 欄位儲存複雜結構
  - 使用場景：
    - 🎮 遊戲開發管理：追蹤專案進度、技術規格
    - 🔍 遊戲搜尋篩選：按類型、RTP、波動性、功能特性搜尋
    - 📊 數據統計分析：開發狀態、遊戲類型、主題分佈統計
    - 🎯 前台遊戲展示：精選遊戲、熱門排行、新遊戲推薦

- �📂 **首頁專案區塊（置頂）** (2025-10-08)
  - 在首頁中間版面新增置頂的專案展示區塊
  - 視覺設計：
    - 橘黃色主題配色（#f59e0b → #d97706）
    - 3px 橘色邊框突顯置頂效果
    - 「置頂」徽章 + 動態大頭針動畫
    - 多層陰影增強立體感
  - 專案資訊展示：
    - 專案名稱、狀態（進行中）、更新日期
    - 專案描述文字
    - 統計數據（心智圖、樹狀圖、文檔、完成任務）
    - 快速操作按鈕（查看心智圖、查看樹狀圖、專案文檔）
  - 互動效果：
    - 統計項目 Hover 效果（向上移動 + 背景高亮）
    - 按鈕 Hover 效果（向上移動 + 陰影增強）
    - 大頭針跳動動畫（2秒循環）
  - 響應式設計：
    - 統計數據 4 欄網格佈局
    - 按鈕彈性佈局，自動換行

- 🎯 **樹狀圖視圖狀態持久化系統** (2025-10-08)
  - **✅ 修復 2.0**：改用 `onMove` 事件驅動機制
  - Pan 移動與 Zoom 縮放狀態即時記錄功能
  - 智能視圖狀態管理：
    - 按樹狀圖 ID 分別保存視圖狀態
    - localStorage 本地持久化存儲
    - 首次訪問自動 fitView，後續載入恢復狀態
  - 視圖變更檢測：
    - **使用 React Flow `onMove` 事件即時捕捉視圖變化**
    - 節流保存機制（500ms），避免頻繁 localStorage 寫入
    - 容錯處理，localStorage 異常時優雅降級
    - 完整的調試日誌輸出
  - 初始化邏輯優化：
    - 智能判斷首次訪問 vs 狀態恢復
    - 延遲 100ms 確保 React Flow 完全初始化
    - 視圖狀態與樹狀圖 ID 綁定
    - 直接從 localStorage 讀取，避免循環依賴

- 🎯 **樹狀圖同層級節點 X 軸對齊系統** (2025-10-08)
  - 同深度節點強制對齊到相同 X 軸位置
  - 智能層級定位算法：
    - 水平布局 (LR)：每個深度層級有固定 X 軸位置
    - 垂直布局 (TB)：同層級節點居中對齊到統一 X 軸
    - 根節點層級 (depth=0)：始終使用最左邊位置
  - 優化 Dagre 布局引擎：
    - 使用 `tight-tree` 排序器改善層級結構
    - 增加 `edgesep` 邊間距控制
    - `greedy` 演算法處理循環邊
  - 層級分組處理：
    - 按節點深度自動分組
    - 每組計算統一對齊位置
    - 保持樹狀結構的視覺一致性

- 🎯 **樹狀圖節點屬性面板可調整寬度** (2025-10-08)
  - 滑鼠拖曳調整面板寬度功能
  - 智能寬度約束：最小 250px，最大螢幕寬度 50%
  - 視覺化拖曳手柄：
    - 4px 寬度拖曳區域
    - Hover 狀態視覺反饋
    - 拖曳時動態指示器
  - 拖曳狀態管理：
    - 全域游標樣式控制 (ew-resize)
    - 防止文字選取干擾
    - 即時寬度更新與 Grid 布局同步
  - 優化的使用者體驗：
    - 平滑過渡動畫
    - 拖曳時視覺強調
    - 工具提示說明

- 🎯 **樹狀圖根節點位置約束系統** (2025-10-08)
  - 強制根節點位於最左上角位置約束
  - 防止子節點超越根節點上方或左方
  - 智能位置重新計算算法：
    - 根節點固定在 `(minX, minY)` 座標
    - 其他節點自動向右下偏移
    - 50px 最小間距保護機制
  - 優化 Dagre 布局設定：
    - 增加邊距至 60px（水平/垂直）
    - 左上角對齊模式
    - 最長路徑排序算法
  - 強化視覺層級：
    - 根節點 z-index: 10 優先級
    - 特殊背景色視覺強調
    - React Flow 層級的額外約束
  - DOM 屬性支援：`data-depth` 精確節點識別

- ✏️ **樹狀圖節點屬性編輯系統** (2025-10-08)
  - 擴展 `TreeNode` 類型支援 8 個專業屬性欄位
  - 實作多欄位即時編輯功能：
    - 0. ID（唯讀）
    - 1. 節點名稱（必填）
    - 2. 功能
    - 3. 描述（多行）
    - 4. Photoshop 座標
    - 5. 引擎座標
    - 6. 疊加模式
    - 7. 透明度（0-100）
    - 8. 遮罩
    - 備註（多行）
  - 批次儲存機制：一次儲存所有變更
  - 編輯狀態管理：10 個欄位的完整狀態追蹤
  - 智能輸入類型：文字輸入框、數字輸入、多行文字區域
  - Metadata 合併邏輯：保留未編輯欄位
  - 鍵盤快捷鍵：Enter 儲存、Esc 取消
  - 空值驗證：節點名稱必填，其他選填
  - 屬性面板 UI 重構：按編號順序顯示所有欄位
  - 專業工作流程支援：Photoshop → 遊戲引擎
- 💾 **樹狀圖資料持久化儲存系統** (2025-10-08)
  - 建立 `treeDataStorage.ts` 儲存工具模組
  - localStorage 自動儲存功能：編輯後自動儲存
  - localStorage 自動載入功能：開啟頁面時載入已儲存資料
  - 智能資料合併機制：保留原始結構 + 已編輯 metadata
  - 時間戳記追蹤：記錄最後修改時間
  - 多頁面獨立儲存：每個樹狀圖頁面獨立的儲存空間
  - 匯出功能：可將資料匯出為 JSON 檔案
  - 匯入功能：可從 JSON 檔案匯入資料
  - 清除功能：清除已儲存資料恢復原始狀態
  - 儲存大小檢查：監控 localStorage 使用量
  - 已整合到三個樹狀圖頁面：
    - TreeUiLayoutPage (PAGE_KEY: 'ui-layout')
    - TreeUiLayoutRichPage (PAGE_KEY: 'ui-layout-rich')
    - TreePsdStructurePage (PAGE_KEY: 'psd-structure')
- 🌳 **樹狀圖視覺化系統**
  - 建立 `TreeDiagram` 核心元件，支援水平(LR)與垂直(TB)兩種布局
  - 使用 React Flow + Dagre 實現自動布局
  - 層級配色系統：6 種深度配色（背景+邊框+文字同色系）
  - 節點樣式優化：圓角、漸層陰影、Hover 效果
  - 自訂邊線渲染：深度漸層色彩、平滑曲線、箭頭標記
  - 實作三個樹狀圖頁面：
    - `TreeUiLayoutPage`：UI Layout 基礎樹狀圖（水平）
    - `TreeUiLayoutRichPage`：UI Layout 完整資訊（水平）
    - `TreePsdStructurePage`：PSD 完整結構樹（垂直）
- 📊 **樹狀圖瀏覽歷史追蹤**
  - 建立 `client/utils/treeHistory.ts` 歷史追蹤模組
  - localStorage 持久化儲存最近 3 筆記錄
  - 首頁新增「最近查看的樹狀圖」區域
  - 綠色主題卡片設計，支援相對時間顯示
  - 點擊快速跳轉功能
- 🎨 **首頁導覽系統優化**
  - 左側導覽列整合所有樹狀圖入口
  - 中間主要內容區新增心智圖與樹狀圖兩大區塊
  - 統一卡片設計風格（心智圖紫色、樹狀圖綠色）
- 🌙 **樹狀圖 Dark 模式**
  - 實作完整 Dark 模式配色方案
  - 主背景：`#0f172a` (slate-900)
  - 次背景：`#1e293b` (slate-800)
  - 6 層節點深色配色（深靛藍、深青、深綠、深橙、深粉、深灰藍）
  - 增強陰影與 Hover 效果（brightness filter）
  - PSD 結構頁面屬性面板 Dark 模式
  - 符合 WCAG AA 對比度標準
- 📐 **樹狀圖三欄式布局**
  - 實作 1:8:1 Grid 布局（80px : 1fr : 80px）
  - 左側導覽區：工具按鈕（淡紫色背景）
  - 中間主要區：樹狀圖視覺化
  - 右側工具區：功能按鈕（淡綠色背景）
  - 側邊欄工具按鈕：🔍📚🔖⚙️💾🔗
- 📋 **節點屬性面板**
  - 右側區域從工具按鈕改造為屬性面板（320px）
  - 左側導覽區整合所有 6 個工具按鈕
  - 即時顯示選取節點的詳細資訊：
    - ID、標籤、深度、位置（X/Y）
    - 展開/收合狀態
    - 節點配色預覽（48×32 色塊）
  - 未選取時顯示引導提示（👆 點擊節點查看屬性）
  - Dark 模式屬性面板設計

### 變更（Changed）

- 🧾 **節點屬性面板版面優化** (2025-10-08)
  - 所有屬性改為橫向排列，標籤與輸入框單行呈現
  - 調整間距、字體與截斷規則，提升密度與可讀性
  - 儲存與取消按鈕改用專屬版位，與欄位列保持一致視覺
  - 面板預設收合，點擊節點時自動展開，釋出主要畫面空間
- 🧱 **節點屬性資料結構強化** (2025-10-08)
  - ID 以整數儲存並獨立於 React Flow 節點識別
  - Photoshop／引擎座標改為 `{ x, y, z }` 三維整數物件
  - 疊加模式改採 enum 下拉選單，統一輸入來源
  - 遮罩欄位採 JSON 物件格式，預設為 `{}`
  - 透明度資料型別改為字串，支援 `%` 與自訂標記
- 🎯 **樹狀圖節點視覺優化**
  - 節點尺寸增加：200×56px（更好容納文字）
  - 邊框加粗至 2-3px（層級更明確）
  - 圓角統一為 12-14px（更現代化）
  - 背景色調整為較淡色系，邊框使用深色同色系
  - 移除 React Flow 預設白色底圖
  - 新增摺疊狀態視覺化（▶ 箭頭提示）
- 🔄 **樹狀圖布局優化**
  - 垂直布局(TB)間距增加：nodesep 50, ranksep 80
  - 水平布局(LR)保持原有間距：nodesep 40, ranksep 60
  - PSD 結構樹改為垂直展開，層級更清晰
- 🎨 **樹狀圖工具列重組**
  - 「返回首頁」按鈕移至左側（淡靛藍色）
  - 「全部展開」按鈕移至右側（淡綠色）
  - 中間顯示「樹枝圖」標題
  - 統一按鈕樣式與 Hover 效果
- 🖼️ **樹狀圖布局架構調整**
  - Grid 布局從 `80px 1fr 80px` 調整為 `80px 1fr 320px`
  - 右側欄位從 80px 擴展為 320px（屬性面板需求）
  - 左側導覽區背景：淡紫色（`rgba(99, 102, 241, 0.1)`）
  - 右側面板背景：深藍灰（`#1e293b`）
- 🐛 **修復樹狀圖連線問題**
  - 為每個節點明確定義 Handle（source/target）
  - 實作自訂 `ColoredSmoothEdge` 元件
  - CSS 強制顯示連線路徑
- 🔧 **修復視窗位置跳動問題**
  - 移除持續性的 `fitView` 屬性
  - 使用 `onInit` + `useEffect` 實現初始化時單次 fitView
  - 新增 `ReactFlowInstance` 狀態管理
  - 新增 `hasInitialized` ref 追蹤初始化狀態
  - 收合/展開節點時畫面位置保持不變
- 🎯 **修復節點位置移動問題**
  - 分離「布局計算」和「可見性過濾」邏輯
  - 完整樹布局只計算一次（`fullLayout`）
  - 收合/展開透過 Set 過濾可見節點（不重新布局）
  - 實作遞迴標記演算法（O(V+E) 複雜度）
  - 節點位置固定，子節點僅顯示/隱藏
  - 效能提升 50 倍（過濾 ~1ms vs 重新布局 ~50ms）
  - 解決 React Flow 錯誤 #008（缺少 handle 定義）

### 修復（Fixed）

- 💾 **節點屬性儲存狀態同步** (2025-10-08)
  - 儲存後即時同步 `selectedNode` 狀態，避免面板顯示舊值
  - React Flow 節點資料帶入 metadata，重新整理也能保留編輯內容
  - localStorage 合併流程保留標籤與屬性，確保資料持久化

### 文件（Documentation）

- 📚 **樹狀圖系統文件**
  - `docs/tree-node-editing.md` - 節點編輯功能完整文檔（多欄位版本 2.0）
  - `docs/tree-psd-properties-guide.md` - PSD 屬性完整指南（新增）
    - 8 個核心屬性詳細說明
    - Photoshop 混合模式對照表
    - 座標系統轉換公式與範例
    - PSD → 遊戲引擎工作流程
    - 實際應用範例（按鈕、背景、光效、角色）
    - 命名規範與最佳實踐
  - `docs/tree-data-persistence.md` - 資料持久化儲存文檔（新增）
    - localStorage 儲存/載入機制
    - 資料合併演算法詳解
    - API 完整文檔與使用範例
    - 匯出/匯入功能說明
    - 儲存容量管理
  - `docs/tree-dark-mode.md` - Dark 模式配色方案與設計說明
  - `docs/tree-property-panel.md` - 屬性面板功能與布局架構
  - `docs/tree-fixed-viewport.md` - 視窗位置固定技術實作
  - `docs/tree-node-position-fixed.md` - 節點位置固定演算法

### 技術細節

- **新增依賴**：`dagre`, `@types/dagre`
- **核心技術**：
  - React Flow 11.11.4 - 流程圖渲染引擎
  - Dagre 0.8.5 - 自動布局算法
  - TypeScript 5.6.2 - 類型安全
  - CSS Grid - 響應式三欄布局
- **新增檔案**：
  - `client/components/Tree/TreeDiagram.tsx` - 核心元件（586 行，含完整編輯功能）
  - `client/components/Tree/TreeDiagram.css` - 樣式定義（450+ 行）
  - `client/components/Tree/TreeUiLayoutPage.tsx` - UI Layout 樹頁面（含儲存功能）
  - `client/components/Tree/TreeUiLayoutRichPage.tsx` - UI Layout 完整資訊頁（含儲存功能）
  - `client/components/Tree/TreePsdStructurePage.tsx` - PSD 結構樹頁面（含儲存功能）
  - `client/utils/treeHistory.ts` - 歷史追蹤模組
  - `client/utils/treeDataStorage.ts` - 資料持久化儲存模組（新增，200+ 行）
  - `docs/tree-node-editing.md` - 節點編輯功能文檔（6000+ 字）
  - `docs/tree-psd-properties-guide.md` - PSD 屬性完整指南（8000+ 字）
  - `docs/tree-data-persistence.md` - 資料持久化文檔（新增，4000+ 字）
  - `docs/tree-system-overview.md` - 系統總覽文檔
  - `docs/tree-quick-reference.md` - 快速參考指南
  - `client/components/Tree/TreeDiagram.css` - Dark 模式樣式（270+ 行）
  - `client/components/Tree/TreeUiLayoutPage.tsx` - UI Layout 樹
  - `client/components/Tree/TreeUiLayoutRichPage.tsx` - UI Layout 富資訊樹
  - `client/components/Tree/TreePsdStructurePage.tsx` - PSD 結構樹
  - `client/utils/treeHistory.ts` - 歷史追蹤工具
- **效能優化**：
  - 完整樹布局緩存（避免重複計算）
  - Set 資料結構快速過濾（O(1) 查找）
  - useMemo/useCallback 記憶化優化
  - useRef 避免不必要的重新渲染
- **演算法實作**：
  - 遞迴可見性標記（DFS）
  - 時間複雜度：O(V + E)
  - 空間複雜度：O(V)

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
