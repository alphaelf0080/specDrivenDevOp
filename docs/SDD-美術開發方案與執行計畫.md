# SDD 規格驅動 Slot 美術開發方案與執行計畫

版本：v1.0（2025-10-07）  
適用範圍：5x3 經典輪軸 Slot 基礎款（Base Game），支援多語與跨端美術資產工作流  
關聯文件：
- 規格與計畫：`docs/SDD-開發方案計劃書.md`、`docs/SDD+AI-開發方案計劃書.md`、`docs/SDD+AI-完整開發計劃-範例與排程.md`
- 資產規範：`docs/asset-naming-guide.md`、`docs/psd_structure.md`、`docs/psd_structure.json`
- 品質標準：`docs/definition-of-done.md`、`docs/week0-action-checklist.md`
- 工具腳本：`scripts/check-assets.js`

---
|
## 1. 目標與原則

- 單一真理來源（SSOT）：以 JSON 規格為中心，資產需求與命名由規格驅動，避免口傳與反覆溝通。
- 確定性與可重現：資產清單源自規格，可由腳本重建，輸出一致可驗證。
- 自動化優先：命名、尺寸、壓縮、完整性採腳本校驗，將人工檢查縮到最少。
- 左移質量：美術 DoD 與 QA 檢查自 Week 0 開始導入，避免後期返工。
- 可審計：版本、變更、缺漏報告、檢查報告入庫，支援審計與回放。

成功指標（Art KPI 摘要）：
- 命名與尺寸合規率 100%；壓縮達標率 ≥ 95%。
- 首屏載入 < 2s（桌機目標）；動畫/轉軸 FPS ≥ 60。
- `scripts/check-assets.js` 報告通過（0 高風險缺陷）。

---

## 2. 輸入與輸出（Contract）

輸入（Inputs）：
- 規格檔：`src/specs/**/*.json`（symbols、layout、paylines、多語代碼）
- PSD 結構：`docs/psd_structure.json`（或由 `psd_structure.md` 對照建立）
- 資產規範：`docs/asset-naming-guide.md`（命名/尺寸/壓縮/格式）

輸出（Deliverables）：
- 資產清單索引：`assets/manifest.json`
- 圖像資產：`assets/{bg,symbols,buttons,text,icons,num,effects,lines}/...`
- 音訊資產：`assets/{sfx_*.mp3, bgm_*.mp3}`
- 檢查報告：`docs/reports/assets-check-*.json`（CI 產出）
- 變更報告（重大變更）：`docs/reports/asset-diff-*.json`

`assets/manifest.json` 最小欄位建議（範例）：
```json
{
  "version": "1.0.0",
  "language": ["cn", "tw", "en"],
  "symbols": [
    { "id": "A", "state": ["normal", "glow"], "size": [240,240], "path": "assets/symbols/sym_A_normal.png" }
  ],
  "backgrounds": [ { "id": "mg", "path": "assets/bg/bg_mg.jpg", "size": [1080,1920] } ],
  "buttons": [ { "id": "spin", "states": ["up","hover","down","disable"], "basePath": "assets/buttons/btn_spin_" } ],
  "text": [ { "id": "bfg", "lang": ["cn","tw","en"], "state": ["up","hover"], "basePath": "assets/text/tx_bfg_" } ],
  "audio": { "sfx": ["sfx_spin.mp3","sfx_win.mp3"], "bgm": ["bgm_mg.mp3"] }
}
```

---

## 3. 命名規範與尺寸/格式（要點速覽）

參照 `docs/asset-naming-guide.md`，落地要點：
- 全小寫、底線分隔：`{category}_{context}_{state}_{lang}.{ext}`。
- 常用類別：
  - 背景：`bg_{context}.{ext}`（如 `bg_mg.jpg` 1080×1920 JPG Q85-90）。
  - 符號：`sym_{id}_{state}.png`（標準格 240×240，含 10% 留白）。
  - 按鈕：`btn_{function}_{state}.png`（四態 up/hover/down/disable，最小 88×88）。
  - 文字圖：`tx_{context}_{lang}_{state}.png`（支援 cn/tw/en）。
  - 圖示：`icon_{name}.png`（48×48）。
  - 數字字體：`num_{context}/{char}.png`（統一字元尺寸）。
  - 中獎線：`line_{id}_{state}.png`。
- 壓縮基準：PNG（pngquant 65–80）、JPG（mozjpeg 85–90）、WebP（Q80）。
- 音訊：`sfx_*`、`bgm_*`，MP3 192kbps 或 OGG 128kbps，峰值 ≤ -6dB。

---

## 4. PSD 結構與切圖規則

- 依 `docs/psd_structure.md` 的群組/圖層命名規範建立 PSD：
  - 依場景分組（如 MG/FG/Popup），子組對應資產分類（bg/btn/tx/sym/line）。
  - 四態按鈕各自成組（`up/hover/down/disable`）。
  - 多語文字圖分語系組（`tx_*_{lang}`）。
- 尺寸框與留白：符號標準 240×240（含 10% 留白），避免溢出；背景 1080×1920。
- 切圖原則：
  - 透明元素導出 PNG；非透明大圖優先 JPG；新平台評估 WebP。
  - 輸出檔名應直接符合命名規範，避免二次改名。
- 參考 `docs/psd_structure.json` 可由工具生成切圖腳本（選配）。

---

## 5. 工作流程（端到端）

1) 規格驅動資產清單
- 從 `spec.symbols`、`layout`、`features` 解析出所需資產集合（符號、背景、按鈕、文字、多語等）。
- 建立 `assets/manifest.json` 雛形（可由 Agent 或腳本生成）。

2) 視覺設計與導出
- 依 PSD 規範設計、命名、標尺與留白；導出為對應目錄與命名。
- 大圖先出 JPG；透明與 UI 元件出 PNG；視平台另行輸出 WebP。

3) 檢查與修正（自動化）
- 執行資產檢查腳本：命名、尺寸、四態齊備、多語齊備、壓縮目標。
- 針對缺漏清單修正，直至報告綠燈。

4) 整合與載入策略
- 與 FE 制定 preload/lazy/快取策略；數字字體批次載入。
- 清單與實際載入路徑/版本一致；可追蹤版本。

5) 版本與審計
- 重大變更建立 `asset-diff` 報告；`CHANGELOG` 記錄影響面。
- `manifest.json` 遵循語意化版本；PR 需附檢查報告摘要。

---

## 6. 執行計畫（8 週，雙週 Sprint）

Week 0（5–7 天，前置）
- 對齊目標與 DoD、建立風險登記、規格 v0.1 與基線模擬。
- 完成資產規範共識、`assets/` 目錄骨架、`manifest.json` 雛形。

Week 1–2（M1：規格 v1）
- 規格接近目標 RTP（±2%）；初版資產清單穩定；首批符號風格定稿。
- 建立 PSD 命名範本與四態按鈕模板；文字圖多語樣式定稿。

Week 3–4（M2：原型可視化）
- FE/BE 串接與回放；同 seed 確定性通過。
- 載入策略與首屏素材確定；首批資產導入與檢查綠燈。

Week 5（M3：內容整備）
- 全量資產交付第一輪；`check-assets` 報告零高風險、可接受中低風險項。
- UI 細節修整與尺寸統一；音效/音樂初稿接入。

Week 6（M4：數值平衡）
- 規格優化與 A/B 候選；美術只允許無破壞式調整（顏色、邊框、微幅修飾）。
- 若需調整尺寸或命名，必須走 RFC 變更流程（見 §8）。

Week 7（M5：整合測試）
- 覆蓋率 ≥ 80%，E2E 穩定；性能回歸達標（首屏 < 2s / FPS ≥ 60）。
- 資產壓縮與體積優化（合圖、WebP、lazy 分層）。

Week 8（M6：合規與上線）
- 審計回放端點/記錄就緒；資產/規格/版本/seed 可追溯。
- 發布包檢查清單與 Go/No-Go 決策。

---

## 7. RACI 與角色

- Art Designer（R）：設計、PSD 結構、導出、修正。
- Asset Agent（A/R）：清單生成、規範校驗、報告輸出、優化建議。
- FE（C）：載入策略、性能回歸、UI 呈現。
- QA（C/A）：腳本與報告校核、E2E、回放與確定性測試。
- Tech Lead（A）：變更守門、質量與風險把關。

節奏建議：
- 每日 15 分站會：缺漏與阻塞清單。
- 每週審查：資產體積、壓縮率、首屏時間、報告紅黃燈。

---

## 8. 變更管理（與規格同步）

- RFC 三階段：提案/影響評估 → 實作/驗證 → 審查/合併。
- 大變更判定：涉及新符號、新尺寸、RTP 影響 > 5% 或多語資產新增。
- 必備附件：規格差異、`check-assets` 報告、FE 載入影響、回滾方案。

---

## 9. 品質門（Quality Gates）

- 命名與結構：`asset-naming-guide` 全部命名規則通過。
- 尺寸與格式：符號 240×240，背景 1080×1920，四態齊備，多語齊備。
- 壓縮與體積：達成表定壓縮標準；首頁載入資產總量受控。
- 腳本檢查：`scripts/check-assets.js` 無高風險 Fails；CI 為綠燈。
- DoD 對應：對照 `docs/definition-of-done.md` 之美術與前端條款。

---

## 10. 風險與緩解

- 資產缺漏/延誤：以規格自動生成缺漏清單，站會追蹤；Week 7 保留緩衝。
- 體積過大：WebP、合圖、lazy；數字字體精簡；首屏拆分。
- 多語資產爆量：優先文字動態渲染；必要時僅保留關鍵 UI 為圖檔。
- 變更頻繁：嚴格 RFC 與凍結窗口，避免與數值平衡衝突。

---

## 11. 落地清單（Checklists）

Art 出圖前：
- [ ] PSD 圖層與群組命名符合規範（MG/FG/btn/tx/sym 等）。
- [ ] 尺寸標尺正確，符號留白 10%。
- [ ] 四態按鈕完成；多語文字圖完成既定語系。

導出後：
- [ ] 檔名符合 `{category}_{context}_{state}_{lang}`。
- [ ] 尺寸與透明度正確；無多餘邊界。
- [ ] 壓縮達標；大圖採用 JPG 或 WebP。

整合前：
- [ ] `assets/manifest.json` 條目完整、路徑正確。
- [ ] `scripts/check-assets.js` 報告綠燈。
- [ ] 與 FE 確認載入策略與快取策略。

---

## 12. 附：運行與驗證指引（可貼到 PR 說明）

資產檢查（本機或 CI）
```sh
node scripts/check-assets.js --manifest assets/manifest.json --out docs/reports/assets-check-$(date +%Y%m%d).json
```

FE 快速煙霧測試（示例）
```sh
npm run -s cli -- spin -s src/specs/examples/basic-slot.json --seed demo
```

---

## 13. 後續擴充方向

- 建立 `scripts/generate-asset-manifest.js`：由規格自動生成清單。
- 導入 WebP 自動轉換與體積門檻（Fail Fast）。
- 以 `docs/psd_structure.json` 自動生成 Photoshop JSX 切圖腳本。
- 建立多語資產覆蓋率儀表板（CI 報告可視化）。

---

更新紀錄：
- v1.0（2025-10-07）首次彙整：基於現有 SDD/AI/DoD/資產規範文件，輸出可執行的美術方案與排程。
