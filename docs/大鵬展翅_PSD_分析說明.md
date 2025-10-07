# 大鵬展翅_主檔案_20240701.psd 分析說明（Slot Game 美術素材）

本文件彙整 `docs/大鵬展翅_主檔案_20240701-assets/大鵬展翅_主檔案_20240701.psd` 的群組結構、圖層類型、遮罩使用與多語系資產，並提供輸出與命名建議，作為美術與前端整合的依據。

- 畫布尺寸：1080 × 1920 px（直式）
- 場景分層：MG（Base/Main Game）、FG（Free Game/Free Spins）、共用 UI 與轉場/載入
- 命名語系縮寫：`cn`（簡中）、`tw`（繁中）、`en`（英文）

## 1) 高階分區與用途

- MG
  - 主要背景與場景構成：`bg_mg.jpg`（含遮罩）、`bg_mg_預覽`（多層組合：天空、建築、樹、reel 參考等）。
  - 光效：`陽光特效`（Linear Dodge）。
  - 購買免費遊戲入口：完整的按鈕狀態、語系文案與數字字元集（詳見第 3 節）。
- 主操作區（UI）
  - 主要操作按鈕與狀態圖：`btn_spin`、`btn_stop`、`btn_auto`、`btn_turbo`、`btn_turbo_on`、`btn_bet_increase`、`btn_bet_decrease`、`btn_bet`、`btn_bet (XC特規版)` 等。
  - 內含製作/對位參考：`按鈕組製作範圍`、`製作範圍300X300` 等，供切圖與九宮格/熱區對位使用。
- FG
  - Free Game 場景：`bg_fg.jpg`（子層：`fg_bg_sky`, `fg_top_sky` 等）。
  - Free Spins 文案與裝飾：`Free Spins` 群組、相關英文文案層。
- 共用資產
  - 轉軸背景/框：`bg_reel.png`。
  - 符號重點：`wild_1`, `wild_2`, `wild_4x1`, `scatter`，搭配 `WILD` 文字、陰影層。
  - Marquee/提示文案（多語）：`tx_marquee_info_wild_{lang}.png`、`tx_marquee_info_scatter_{lang}.png`，另含英文說明行（如 `trigger10 Free Spins`、`Expanding Wild will locked 3 times in Free Spins`）。
  - LOGO：`tx_logo_{lang}.png`（標題）、載入用 LOGO：`tx_loading_logo_{lang}.png`。
  - 轉場/載入：`ani_fg_transition.jpg`、`bg_loading.jpg`。
  - JP（Jackpot）群組：包含色底（藍/黃）與數字底、`JP_tx` 文案層。

## 2) UI 按鈕與狀態清單（關鍵切圖）

所有主要按鈕均具備以下狀態資產，並常見於獨立群組：
- 狀態：`up` / `hover` / `down` / `disable`（disable 常見 30% 透明或去彩處理，部分使用調整圖層）。
- 結構：外框/底形（多個 `矩形`、`形狀` 子層）、內部 ICON（如 `icon_spin`、`icon_auto`）、語系文案覆蓋（若有）。

具體清單（節錄）：
- `btn_spin_*`：`btn_spin_up.png`、`btn_spin_hover.png`、`btn_spin_down.png`（內含 `pic_spin*` 子群與 `icon_spin`）。
- `btn_stop_*`：含「停止自動」數字覆蓋（`num_auto_*_預覽` 與 `num_auto_自動倒數數字出圖用`）。
- `btn_auto_*`：同上三態，並有 `btn_auto_disable_up30%透明度` 版本。
- `btn_turbo_*` 與 `btn_turbo_on_*`：分別代表 Turbo 關閉與開啟的雙套 UI，皆有四態。
- `btn_bet_increase_*`、`btn_bet_decrease_*`：加/減投注，四態完整。
- `btn_bet_*` 與 `btn_bet (XC特規版)`：一般版與特規版各自獨立四態一套，皆內含 `pic_totalbet` 等子層。

切圖建議：
- 將各狀態群組以 Trim（去透明邊）輸出，保留統一外擴留白，用於九宮格或居中對位。
- 若要九宮格，請在 `製作範圍` 參考框內固定留邊，避免 hover/down 尺寸變化導致跳動。
- Disable 版面若透過調整圖層（Hue/Saturation）實現，請輸出「調整後的合成圖」，避免遊戲端再套調整。

## 3) 購買免費遊戲入口（Buy Free Game, BFG）

組織結構清晰且可直接切圖：
- 按鈕底圖：`btn_bfg_{state}.png`（含多個矩形/形狀造型與高光/光暈）。
- 語系文案：`tx_bfg_{lang}_{state}.png`，繁中/簡中/英文各一層（例：`購買免費遊戲`、`Buy Free Game`）。
- 數字組件：`num_bfg_{state}` 內含字元集，方便在 UI 端組合價格或倍率：
  - 字母：`Y`、`X`、`B`、`M`、`K`；數字：`0–9`；標點：`point`（小數點）、`comma`（逗號）。
  - 並提供 `hover_用up_放大110%`、`down_用up_縮小90%` 的視覺對應版本。

整合建議：
- 遊戲端可優先採用「純底圖 + 語系文案 + 數字字元集」動態組合，減少多圖檔，提升在地化與數字變化的彈性。
- 若使用動態字串，請確認字距與對齊規則，維持 hover/down 狀態的一致視覺中心。

## 4) 符號與特效重點（Symbols & Effects）

- WILD：`wild_1`、`wild_2`、`wild_4x1` 與多個 `WILD` 文字、`WILD陰影` 層。
  - FG 段落文案提到「Expanding/Lock Wild」在 Free Spins 期間的行為，對應美術特效層可用於演出。
- SCATTER：`scatter` 與 `SCATTER` 文字層。
- Marquee 文案（多語）：
  - `tx_marquee_info_wild_{lang}.png`、`tx_marquee_info_scatter_{lang}.png`。
  - 英文補充行：`trigger10 Free Spins`、`Expanding Wild will locked 3 times in Free Spins`（多處重複版本）。

建議：
- 將 WILD/SCATTER 的「底圖」與「文字/陰影」獨立輸出，可於程式端做發光、描邊或動態上色。
- 對於 4x1 之類特殊尺寸（擴展 WILD）另列資產，以避免錯切導致對位偏移。

## 5) 背景、轉場與 LOGO

- 背景：`bg_mg.jpg`（含遮罩）、`bg_fg.jpg`、`bg_reel.png`。
- 轉場/載入：`ani_fg_transition.jpg`、`bg_loading.jpg`。
- LOGO：標題 `tx_logo_{lang}.png` 與載入 LOGO `tx_loading_logo_{lang}.png`（`logo` 群組）。

建議：
- 背景建議維持原圖尺寸輸出；若需高解析或動態縮放，請另備 1.5x/2x 版本。
- `bg_reel.png` 可獨立輸出，用於遮擋符號上下界或設計轉軸內陰影。

## 6) 遮罩與調整圖層使用

- 多數 UI 群組（特別是 BFG 與按鈕四態）見「遮色片: 有」：
  - 用於裁切高光/漸層、圓角造型或局部發光。
- Disable 狀態常見 Hue/Saturation 調整層（含遮罩），統一去彩/降明度。
- 文案群組（`tx_*`）亦常含遮罩，用於字形裁切與邊緣反鋸齒。

整合注意：
- 輸出時以群組合成結果為準，避免保留未展開之調整層行為到程式端。
- 若需後期動態發光/色偏，請另保留無光版底圖與 alpha。

## 7) 同名層與命名優化建議（同層名稱）

在 PSD 中可見多個重複命名：如 `圖層 1237`、`矩形 1 拷貝*`、多個 `WILD`、`wild_2` 等，容易在批次輸出或自動化腳本時混淆。

- 建議命名規範
  - UI：`btn_{feature}_{state}`（必要時加後綴：`_bg`、`_icon`、`_tx_{lang}`）。
  - 數字/字元集：`num_{feature}_{state}/{glyph}`（如 `num_bfg_up/9.png`）。
  - 符號：`sym_{name}`、擴展尺寸加標：`sym_{name}_4x1`。
  - 文案：`tx_{scope}_{topic}_{lang}`（如 `tx_marquee_info_scatter_en`）。
- 可在導出前做一輪「重命名清理」：
  - 合併重複 glyph 或刪除無用拷貝層。
  - 對 `WILD`/`SCATTER` 相關層，分為 `base`、`tx`、`shadow` 子層，清楚分責。

## 8) 建議輸出目錄與檔名（供美術/前端共用）

- backgrounds
  - `bg_mg.jpg`、`bg_fg.jpg`、`bg_reel.png`、`ani_fg_transition.jpg`、`bg_loading.jpg`
- logo
  - `tx_logo_{lang}.png`、`tx_loading_logo_{lang}.png`
- ui/buttons
  - `btn_spin_{state}.png`、`btn_stop_{state}.png`、`btn_auto_{state}.png`
  - `btn_turbo_{state}.png`、`btn_turbo_on_{state}.png`
  - `btn_bet_increase_{state}.png`、`btn_bet_decrease_{state}.png`
  - `btn_bet_{state}.png`、`btn_bet1_{state}.png`（XC 特規）
- ui/bfg
  - `btn_bfg_{state}.png`、`tx_bfg_{lang}_{state}.png`
  - `num_bfg_{state}/{glyph}.png`（0–9, point, comma, Y, X, B, M, K）
- symbols
  - `sym_wild_1.png`、`sym_wild_2.png`、`sym_wild_4x1.png`、`sym_scatter.png`
  - `sym_wild_tx.png`、`sym_wild_shadow.png`（如需分離文字/陰影）
- marquee
  - `tx_marquee_info_wild_{lang}.png`、`tx_marquee_info_scatter_{lang}.png`
  - `tx_fs_trigger_en.png`（例：trigger10 Free Spins）
- jp
  - `jp_bg_blue.png`、`jp_bg_yellow.png`、`JP_tx_{lang}.png`

備註：`{state}` ∈ {`up`, `hover`, `down`, `disable`}；`{lang}` ∈ {`cn`, `tw`, `en`}。

## 9) 匯出與整合檢查清單（QA）

- 尺寸與對位
  - 按鈕四態外框尺寸一致；hover/down 僅作亮度/縮放在可接受範圍，中心點一致。
  - 需九宮格的按鈕，請對齊 `製作範圍`，保留邊距一致。
- 語系與字元集
  - `tx_*_{lang}` 三語皆有；BFG 數字/字母/標點齊全，實機可拼出價格或倍率。
- 遮罩與調整
  - 所有有遮罩的群組以合成結果輸出；Disable 狀態輸出去彩後版本。
- 符號與特效
  - Wild/Scatter 底圖與文字/陰影若分離，需提供對位基準與同中心點。
- 命名
  - 無「圖層 XXX」「矩形 1 拷貝」等歧義命名出現在最終輸出檔名。

## 10) 待補與注意事項

- 若之後新增其他語系，`tx_*_{lang}` 與 `num_*` 字元集需同步擴充。
- 若遊戲端要做動態色偏/發光，請提供對應「無光版」底圖與可分離的文字/陰影資產。
- `btn_bet (XC特規版)` 與一般版請在實機上驗證切換時的對位一致性。

— 完 —

## 11) 圖層/群組結構總覽（精簡）

- MG
  - bg_mg_預覽（天空、背景建築+樹、建築、reel 參考）
  - bg_mg.jpg（含遮罩）
  - 陽光特效（Linear Dodge）
  - 購買免費遊戲入口（BFG）
    - btn_bfg_{state}.png（up/hover/down/disable）
    - tx_bfg_{lang}_{state}.png（cn/tw/en）
    - num_bfg_{state}（字元集：0–9、Y/X/B/M/K、point/comma）
- 主操作區（UI）
  - btn_spin（up/hover/down + icon）
  - btn_stop（含 num_auto 字元集）
  - btn_auto（up/hover/down/disable）
  - btn_turbo（up/hover/down/disable）
  - btn_turbo_on（up/hover/down/disable）
  - btn_bet_increase / btn_bet_decrease（各四態）
  - btn_bet（一般）/ btn_bet（XC 特規）
- FG
  - bg_fg.jpg（fg_bg_sky / fg_top_sky）
  - Free Spins 文案群組
- 共用/其他
  - bg_reel.png（轉軸底/框）
  - sym定位（5×4 轉軸格定位矩形）
  - sym（示例符號擺位）
  - wild_*/scatter 與文案、Marquee 文案（多語）、logo/轉場/載入

## 12) 主要元件輸出大小與座標（PSD 原始）

說明：以下座標與尺寸皆為 PSD 畫布原始座標系（1080×1920，原點在左上），格式為：
- 範圍：(x1, y1) – (x2, y2)  w×h；中心：(cx, cy) = ((x1+x2)/2, (y1+y2)/2)
- 規模化（0–1）：x%、y%、w%、h% 以 1080、1920 為分母

- btn_spin_up 按鈕底
  - 範圍：(421, 1516) – (658, 1753)  237×237；中心：(539.5, 1634.5)
  - 規模化：x%=0.39, y%=0.85, w%=0.22, h%=0.12（四捨五入）
  - 功能：Spin 觸發（或依遊戲狀態切換為 Stop）

- btn_auto_up 按鈕底
  - 範圍：(713, 1576) – (838, 1701)  125×125；中心：(775.5, 1638.5)
  - 功能：自動旋轉（Auto）開關

- btn_turbo_up 按鈕底（Turbo 關）
  - 範圍：(890, 1576) – (1015, 1701)  125×125；中心：(952.5, 1638.5)
  - 功能：快速旋轉（Turbo）開關（off 狀態）

- btn_turbo_on_up 按鈕底（Turbo 開）
  - 範圍：(890, 1576) – (1015, 1701)  125×125；中心同上
  - 功能：快速旋轉（Turbo）開啟狀態對應按鈕

- btn_bet_increase_up（加注）
  - 範圍：(208, 1581) – (381, 1694)  173×113；中心：(294.5, 1637.5)
  - 功能：投注增加

- btn_bet_decrease_up（減注）
  - 範圍：(38, 1581) – (211, 1694)  173×113；中心：(124.5, 1637.5)
  - 功能：投注減少

- btn_bet_up（投注按鈕，一般版）
  - 範圍：(139, 1567) – (281, 1709)  142×142；中心：(210, 1638)
  - 功能：開啟投注面板/確認投注

- btn_stop_up（停止自動數字按鈕）
  - 底圖與 spin 尺寸一致（237×237，中心約 539.5, 1634.5）
  - 另附 num_auto 字元集疊加顯示剩餘次數（見 btn_stop 區塊）

- BFG（購買免費遊戲）
  - 按鈕底（up 狀態主體）：約 (308, 1298) – (772, 1470)  464×172
  - 文案（tw 例）：(375, 1322) – (701, 1368)  326×46
  - 數字示意區（num_bfg_up_預覽）：(496, 1388) – (581, 1441)  85×53
  - 功能：開啟/確認購買免費遊戲；數字/字母/標點由 num_bfg 組合顯示

- bg_reel（轉軸底/框）
  - 範圍：(-208, 234) – (1288, 1194)  1496×960（寬超出畫布，左右溢出）
  - 建議：依實機畫面裁切或採遮罩，與 sym定位 對齊使用

## 13) 轉軸格子（sym定位）與前端索引

sym定位 以 5 欄 × 4 列矩形標示每一格的可視區域（單格基準尺寸約 215×203px）：
- 第 1 欄 x 範圍：2–217；第 2 欄：217–432；第 3 欄：432–647；第 4 欄：647–862；第 5 欄：862–1077
- 列 y 範圍：第 1 列 351–554；第 2 列 551–754；第 3 列 751–954；第 4 列 951–1154

前端可用零基索引 reel[col][row] 對應：
- 例如欄 0、列 0（左上）中心約：(109.5, 452.5)，尺寸 215×203
- 欄 4、列 3（右下）中心約：(969.5, 1052.5)，尺寸 215×203

建議前端以中心點 + 尺寸布局符號貼圖；如需要留內縮（padding）以避免溢框，建議各邊留 4–8 像素視覺安全邊。

## 14) 前端引擎座標對應與換算

基礎：PSD 空間（Wpsd=1080, Hpsd=1920），前端畫面（W, H）。

- 直接拉伸（不建議變更比例）：
  - sx=W/1080, sy=H/1920；
  - x' = x·sx, y' = y·sy, w' = w·sx, h' = h·sy。

- 等比縮放 + 信箱(letterbox)：
  - s = min(W/1080, H/1920)
  - 內容尺寸：Wc = 1080·s, Hc = 1920·s
  - 偏移：ox = (W - Wc)/2, oy = (H - Hc)/2
  - 轉換：x' = ox + x·s, y' = oy + y·s, w' = w·s, h' = h·s

示例：裝置 720×1280（9:16），採等比縮放：
- s = min(720/1080, 1280/1920) = 0.6667；ox=0, oy=0
- btn_spin_up（237×237 @ 421,1516）→ x'=281, y'=1011, w'=158, h'=158（四捨五入）

欄位建議（供引擎配置）：
- id、role（功能：spin/auto/turbo/bet+/bet-/bet/bfg/symbol-cell 等）、state（up/hover/down/disable）、bbox（x,y,w,h）、anchor（cx,cy）、percent（x%,y%,w%,h%）。

JSON 片段示例（規模化 0–1，供前端還原）：
{
  "btn_spin_up": {"role": "spin", "bboxPct": {"x": 0.390, "y": 0.789, "w": 0.219, "h": 0.123}},
  "btn_auto_up": {"role": "auto", "bboxPct": {"x": 0.660, "y": 0.821, "w": 0.116, "h": 0.065}},
  "btn_turbo_up": {"role": "turbo", "bboxPct": {"x": 0.824, "y": 0.821, "w": 0.116, "h": 0.065}},
  "bfg_button_up": {"role": "bfg", "bboxPct": {"x": 0.285, "y": 0.676, "w": 0.430, "h": 0.090}},
  "reel_cell_0_0": {"role": "symbol-cell", "bbox": {"x": 2, "y": 351, "w": 215, "h": 203}}
}

備註：bboxPct.x/y 為左上角相對百分比；若採中心對齊，請改存 anchorPct（cx/1080, cy/1920）。

## 15) 對應功能一覽

- btn_spin_*：旋轉（Spin）；在 Auto 進行中可切換為 Stop（依邏輯）
- btn_stop_*：停止自動旋轉（顯示剩餘次數字元）
- btn_auto_*：自動旋轉（Auto）開關
- btn_turbo_* / btn_turbo_on_*：快速旋轉（Turbo）開關（off/on 兩套）
- btn_bet_increase_* / btn_bet_decrease_*：投注加/減
- btn_bet_*（一般/特規）：開啟投注面板或確認投注
- BFG：購買免費遊戲（含三語文案與數字字元集動態組合）
- bg_reel + sym定位：轉軸底與符號落點格

— 補充完成 —

## 16) 程式可直接使用的版位 JSON

為了便於前端快速落版，已產生「全套」JSON（座標以 PSD 空間 1080×1920 定義，並含百分比欄位）：

- docs/layout/manifest.json：完整總表（依分類 backgrounds/ui/bfg/reel/symbols/marquee/logo/jp/transitions）+ flat 全節點清單
- docs/layout/ui_layout.json：底部操作 UI（Spin/Stop/Auto/Turbo/Bet +/- 等）
- docs/layout/bfg_layout.json：BFG 按鈕 + 語系文案 + 數字 glyph 定位
- docs/layout/reel_layout.json：5×4 轉輪格子（含 bboxPx 與 bboxPct）

使用方式請見 docs/layout/README.md（含等比縮放與信箱換算公式、中心點計算）。
