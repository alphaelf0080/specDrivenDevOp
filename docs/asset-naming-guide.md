# 資產命名規範速查表

## 版本資訊
- 版本：v1.0
- 日期：2025-10-06
- 適用範圍：所有遊戲資產（圖片、音效、字體等）

---

## 命名原則

### 基本規則
1. **全小寫**：使用小寫英文與數字
2. **底線分隔**：使用 `_` 分隔不同部分，不使用空格或 `-`
3. **有意義的名稱**：檔名應清楚表達用途
4. **一致性**：同類型資產使用相同命名模式

### 格式結構
```
{category}_{context}_{state}_{lang}.{ext}
```

- **category**：資產類別（bg/sym/btn/tx/icon/num/pic/line）
- **context**：用途或場景（mg/fg/reel/spin/info 等）
- **state**：狀態（normal/hover/down/disable/glow 等）
- **lang**：語言（cn/tw/en，選配）
- **ext**：檔案格式（png/jpg/webp/mp3/ogg）

---

## 資產類別與範例

### 1. 背景（Background）

**格式**：`bg_{context}.{ext}`

| 檔名 | 說明 | 尺寸建議 | 格式 |
|-----|------|---------|------|
| `bg_mg.jpg` | 主遊戲背景 | 1080×1920 | JPG (Q85-90) |
| `bg_fg.jpg` | 免費遊戲背景 | 1080×1920 | JPG (Q85-90) |
| `bg_reel.png` | 轉軸框架/背景 | 依設計 | PNG-24 |
| `bg_popup.png` | 彈窗背景 | 800×600 | PNG-24 |

---

### 2. 符號（Symbols）

**格式**：`sym_{id}_{state}.png`

| 檔名 | 說明 | 狀態說明 |
|-----|------|---------|
| `sym_A_normal.png` | A 符號常態 | 靜止顯示 |
| `sym_A_glow.png` | A 符號發光 | 中獎時使用 |
| `sym_A_blur.png` | A 符號模糊（選配） | 轉動時使用 |
| `sym_W_normal.png` | Wild 符號 | |
| `sym_S_normal.png` | Scatter 符號 | |
| `sym_m1_normal.png` | 高級符號 1（主題圖案） | |
| `sym_h1_normal.png` | 中級符號 1 | |
| `sym_l1_normal.png` | 低級符號 1（撲克牌） | |

**符號 ID 對照**：
- `A/K/Q/J/10/9`：撲克牌符號
- `m1/m2/m3`：高級符號（Major）
- `h1/h2/h3`：中級符號（High）
- `l1/l2/l3`：低級符號（Low）
- `W`：Wild
- `S`：Scatter

**尺寸**：240×240px（含 10% 留白，實際圖形 216×216px）

---

### 3. 按鈕（Buttons）

**格式**：`btn_{function}_{state}.png`

**四態定義**：
- `up`：常態/預設
- `hover`：滑鼠懸停/觸控反饋
- `down`：按下瞬間
- `disable`：禁用/不可點擊

| 檔名 | 說明 |
|-----|------|
| `btn_spin_up.png` | 旋轉按鈕（常態） |
| `btn_spin_hover.png` | 旋轉按鈕（懸停） |
| `btn_spin_down.png` | 旋轉按鈕（按下） |
| `btn_spin_disable.png` | 旋轉按鈕（禁用） |
| `btn_info_up.png` | 資訊按鈕 |
| `btn_settings_up.png` | 設定按鈕 |
| `btn_menu_up.png` | 選單按鈕 |
| `btn_close_up.png` | 關閉按鈕 |
| `btn_bet_plus_up.png` | 增加投注 |
| `btn_bet_minus_up.png` | 減少投注 |
| `btn_maxbet_up.png` | 最大投注 |
| `btn_autoplay_up.png` | 自動遊戲 |

**尺寸**：最小 88×88px（行動裝置可點擊最小熱區）

---

### 4. 文字圖（Text Images）

**格式**：`tx_{context}_{lang}_{state}.png`

| 檔名 | 說明 |
|-----|------|
| `tx_logo_cn.png` | Logo（簡中） |
| `tx_logo_tw.png` | Logo（繁中） |
| `tx_logo_en.png` | Logo（英文） |
| `tx_bfg_cn_up.png` | 購買免費遊戲（簡中，常態） |
| `tx_bfg_cn_hover.png` | 購買免費遊戲（簡中，懸停） |
| `tx_paytable_cn.png` | 賠付表標題（簡中） |
| `tx_win_cn.png` | 贏分提示文字 |
| `tx_freegame_cn.png` | 免費遊戲標題 |

**語言代碼**：
- `cn`：簡體中文
- `tw`：繁體中文
- `en`：English

---

### 5. 圖示（Icons）

**格式**：`icon_{name}.png`

| 檔名 | 說明 | 尺寸 |
|-----|------|-----|
| `icon_info.png` | 資訊圖示 | 48×48 |
| `icon_settings.png` | 設定圖示 | 48×48 |
| `icon_sound_on.png` | 音效開啟 | 48×48 |
| `icon_sound_off.png` | 音效關閉 | 48×48 |
| `icon_help.png` | 幫助 | 48×48 |
| `icon_home.png` | 主頁 | 48×48 |

---

### 6. 數字字體（Number Fonts）

**格式**：`num_{context}/{char}.png`

**目錄結構**：
```
assets/
└── num_win/
    ├── 0.png
    ├── 1.png
    ├── 2.png
    ├── 3.png
    ├── 4.png
    ├── 5.png
    ├── 6.png
    ├── 7.png
    ├── 8.png
    ├── 9.png
    ├── comma.png      （逗號 ,）
    ├── point.png      （小數點 .）
    └── plus.png       （加號 +）
```

**用途範例**：
- `num_win/`：贏分顯示
- `num_bet/`：投注金額
- `num_balance/`：餘額
- `num_multiplier/`：倍數顯示
- `num_freegame/`：免費次數

**尺寸**：每個字元統一寬高（如 32×48px）

---

### 7. 特效/遮罩（Pictures/Effects）

**格式**：`pic_{purpose}.png`

| 檔名 | 說明 |
|-----|------|
| `pic_reel_mask.png` | 轉軸遮罩 |
| `pic_light_ray.png` | 光線特效 |
| `pic_particle.png` | 粒子特效 |
| `pic_glow.png` | 發光效果 |
| `pic_frame.png` | 邊框裝飾 |

---

### 8. 中獎線（Paylines）

**格式**：`line_{id}_{state}.png`

| 檔名 | 說明 |
|-----|------|
| `line_01_active.png` | 第 1 條線（中獎） |
| `line_01_inactive.png` | 第 1 條線（未中獎） |
| `line_02_active.png` | 第 2 條線（中獎） |
| ... | ... |

---

## 音效命名（Audio）

**格式**：`sfx_{event}.{ext}` 或 `bgm_{context}.{ext}`

### 音效（Sound Effects）

| 檔名 | 說明 | 格式 |
|-----|------|------|
| `sfx_spin.mp3` | 旋轉音效 | MP3/OGG |
| `sfx_stop.mp3` | 停止音效 | MP3/OGG |
| `sfx_win.mp3` | 中獎音效 | MP3/OGG |
| `sfx_bigwin.mp3` | 大獎音效 | MP3/OGG |
| `sfx_btn_click.mp3` | 按鈕點擊 | MP3/OGG |
| `sfx_coin.mp3` | 金幣音效 | MP3/OGG |

### 背景音樂（Background Music）

| 檔名 | 說明 |
|-----|------|
| `bgm_mg.mp3` | 主遊戲背景音樂 |
| `bgm_fg.mp3` | 免費遊戲背景音樂 |
| `bgm_lobby.mp3` | 大廳音樂 |

**音量基準**：
- 峰值（Peak）≤ -6dB
- 平均（RMS）≈ -18dB
- 格式：MP3 (192kbps) 或 OGG (128kbps)

---

## 檔案格式選擇

| 資產類型 | 建議格式 | 說明 |
|---------|---------|------|
| **不透明背景** | JPG (Q85-90) | 檔案小、適合大圖 |
| **透明元件** | PNG-24 | 支援完整 Alpha 通道 |
| **動畫序列** | PNG 序列 | 或使用 Spine/Lottie |
| **現代瀏覽器** | WebP | 檔案更小，漸進採用 |
| **音效** | MP3/OGG | 跨瀏覽器相容 |

---

## 壓縮標準

| 格式 | 工具 | 目標 |
|-----|------|-----|
| **PNG** | pngquant | Quality 65-80, 檔案 ≤ 200KB |
| **JPG** | mozjpeg | Quality 85-90, 檔案 ≤ 500KB (背景) |
| **WebP** | cwebp | Quality 80, Alpha 支援 |
| **MP3** | ffmpeg | 192kbps, Stereo |

**壓縮指令範例**：
```bash
# PNG 壓縮
pngquant --quality=65-80 --ext .png --force assets/**/*.png

# WebP 轉換
for f in assets/**/*.png; do
  cwebp -q 80 "$f" -o "${f%.png}.webp"
done

# JPG 優化
jpegoptim --max=90 --strip-all assets/**/*.jpg
```

---

## 檔案組織結構

```
assets/
├── bg/                 # 背景
│   ├── bg_mg.jpg
│   ├── bg_fg.jpg
│   └── bg_reel.png
├── symbols/            # 符號
│   ├── sym_A_normal.png
│   ├── sym_A_glow.png
│   └── ...
├── buttons/            # 按鈕
│   ├── btn_spin_up.png
│   ├── btn_spin_hover.png
│   └── ...
├── text/               # 文字圖
│   ├── cn/
│   ├── tw/
│   └── en/
├── icons/              # 圖示
├── numbers/            # 數字字體
│   ├── num_win/
│   ├── num_bet/
│   └── ...
├── effects/            # 特效
├── lines/              # 中獎線
├── audio/              # 音效
│   ├── sfx/
│   └── bgm/
└── manifest.json       # 資產索引
```

---

## Checklist（資產交付前）

### 命名檢查
- [ ] 檔名全小寫，無空格
- [ ] 使用 `_` 分隔，格式正確
- [ ] 符號 ID 與規格 `spec.json` 一致
- [ ] 多語系檔案語言標記正確（cn/tw/en）
- [ ] 按鈕四態齊全（up/hover/down/disable）

### 技術檢查
- [ ] 符號尺寸統一（240×240px）
- [ ] 按鈕熱區 ≥ 88×88px
- [ ] PNG 使用 PNG-24（含 Alpha）
- [ ] JPG 品質 85-90
- [ ] 單檔大小符合標準（背景 ≤ 500KB，其他 ≤ 200KB）

### 完整性檢查
- [ ] 規格中的所有符號均有對應圖檔
- [ ] 多語系資產（cn/tw/en）齊全
- [ ] 數字字體 0-9 及符號完整
- [ ] 音效與動畫配對正確

### 壓縮檢查
- [ ] PNG 已執行 pngquant 壓縮
- [ ] JPG 已優化
- [ ] 總資產包 < 10MB（首屏 < 3MB）

---

## 工具腳本

### 檢查命名規範
```bash
# 檢查檔名是否符合規範
node scripts/check-naming.js --assets assets/

# 列出不符合規範的檔案
find assets/ -type f | grep -E '[A-Z]|[ -]'
```

### 批次重命名
```bash
# 將空格替換為底線
for f in assets/**/*\ *; do mv "$f" "${f// /_}"; done

# 轉為小寫
for f in assets/**/*; do mv "$f" "$(echo $f | tr '[:upper:]' '[:lower:]')"; done
```

### 生成資產清單
```bash
# 產生 manifest.json
node scripts/gen-manifest.js --assets assets/ --output assets/manifest.json
```

---

## 參考資料
- 完整資產管理規範：`docs/SDD+AI-開發方案計劃書.md` 附錄 C
- PSD 結構標準：`docs/psd_structure.md`
- 資產檢核腳本：`scripts/check-assets.js`

---

**文檔版本**：v1.0 | 2025-10-06
