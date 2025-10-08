# 樹狀圖 PSD 屬性完整指南

## 📅 建立日期

**2025年10月8日** - 專業屬性欄位系統

## 🎯 概述

本文檔詳細說明樹狀圖節點的 8 個核心屬性欄位，特別針對 Photoshop (PSD) 文件結構和遊戲引擎開發的需求設計。

## 📋 屬性欄位清單

### 0. ID (唯讀)

**類型:** `string`  
**必填:** 是  
**可編輯:** 否

**說明:**  
節點的唯一識別碼，由系統自動生成，不可修改。

**範例:**
```
node_001
layer_bg_main
btn_start_game
```

**用途:**
- 程式內部引用
- 資源檔案對應
- 父子關係建立

---

### 1. 節點名稱

**類型:** `string`  
**必填:** 是  
**可編輯:** 是

**說明:**  
節點在樹狀圖中顯示的名稱，通常對應 Photoshop 圖層名稱或遊戲物件名稱。

**範例:**
```
背景圖層
開始按鈕
角色立繪_主角
UI_血條
```

**命名建議:**
- 使用清晰、描述性的名稱
- 避免使用特殊字元
- 建議使用中文或英文，保持一致性
- 可使用底線分隔不同部分

---

### 2. 功能

**類型:** `string`  
**必填:** 否  
**可編輯:** 是

**說明:**  
描述此節點的主要功能或用途。

**範例:**
```
背景裝飾
互動按鈕
資訊顯示
動畫容器
遮罩層
```

**使用場景:**
- UI 元素功能分類
- 互動元素標記
- 視覺效果說明
- 動畫層標記

---

### 3. 描述

**類型:** `string` (多行)  
**必填:** 否  
**可編輯:** 是

**說明:**  
詳細描述節點的內容、用途、設計意圖等。支援多行文字。

**範例:**
```
主畫面背景圖層，包含：
- 漸層背景 (上藍下紫)
- 星空裝飾元素
- 底部陰影效果
解析度：1920x1080
格式：PNG-24 with alpha
```

**建議內容:**
- 視覺特徵描述
- 設計意圖說明
- 技術規格資訊
- 注意事項

---

### 4. Photoshop 座標

**類型:** `string`  
**必填:** 否  
**可編輯:** 是

**說明:**  
圖層在 Photoshop 畫布中的座標位置，通常是圖層中心點或左上角的座標。

**格式範例:**
```
(100, 200)              # 簡單座標
x:100, y:200            # 明確標記
center: (960, 540)      # 中心點
left:50, top:100        # 左上角
{x: 100, y: 200}        # JSON 格式
```

**座標系統:**
```
Photoshop 座標系統 (左上角為原點)
     X →
  ┌──────────────────
Y │ (0,0)
↓ │
  │      (100, 200)
  │           •
```

**轉換公式:**
```javascript
// PSD 座標轉引擎座標 (假設畫布 1920x1080)
const engineX = psX / 1920;
const engineY = psY / 1080;

// 引擎座標轉 PSD 座標
const psX = engineX * 1920;
const psY = engineY * 1080;
```

---

### 5. 引擎座標

**類型:** `string`  
**必填:** 否  
**可編輯:** 是

**說明:**  
物件在遊戲引擎中的座標位置，通常使用標準化座標 (0-1) 或引擎特定座標系統。

**格式範例:**
```
(0.5, 0.5)              # 畫面中心 (標準化座標)
(960, 540)              # 絕對座標
anchor: center          # 錨點描述
{x: 0.5, y: 0.5}        # JSON 格式
```

**常見引擎座標系統:**

**Unity (標準化座標):**
```
(0, 0) = 左下角
(0.5, 0.5) = 中心
(1, 1) = 右上角
```

**Cocos2d-x (像素座標):**
```
(0, 0) = 左下角
(480, 320) = 螢幕大小相關
```

**Pixi.js (像素座標):**
```
(0, 0) = 左上角
(width, height) = 右下角
```

---

### 6. 疊加模式

**類型:** `string`  
**必填:** 否  
**可編輯:** 是

**說明:**  
圖層的混合模式 (Blend Mode)，決定圖層如何與下方圖層混合。

**Photoshop 混合模式:**
```
Normal          # 正常
Multiply        # 色彩增值
Screen          # 濾色
Overlay         # 覆蓋
Soft Light      # 柔光
Hard Light      # 實光
Color Dodge     # 加亮顏色
Color Burn      # 加深顏色
Darken          # 變暗
Lighten         # 變亮
Difference      # 差異化
Exclusion       # 排除
```

**遊戲引擎對應:**

| Photoshop | Unity | Cocos2d-x | Pixi.js |
|-----------|-------|-----------|---------|
| Normal | SrcAlpha | GL_ONE | NORMAL |
| Multiply | Multiply | GL_DST_COLOR | MULTIPLY |
| Screen | Screen | GL_ONE_MINUS_DST_COLOR | SCREEN |
| Overlay | Overlay | - | OVERLAY |

**使用建議:**
```
光效圖層 → Screen / Add
陰影圖層 → Multiply
高光圖層 → Color Dodge
氛圍圖層 → Soft Light
```

---

### 7. 透明度

**類型:** `number`  
**必填:** 否  
**可編輯:** 是  
**範圍:** 0-100

**說明:**  
圖層的不透明度百分比。100 表示完全不透明，0 表示完全透明。

**範例:**
```
100     # 完全不透明
80      # 80% 不透明度
50      # 半透明
25      # 幾乎透明
0       # 完全透明（不可見）
```

**引擎轉換:**
```javascript
// Photoshop 百分比轉引擎 alpha (0-1)
const alpha = opacity / 100;

// 引擎 alpha 轉 Photoshop 百分比
const opacity = alpha * 100;
```

**常見用途:**
```
背景圖層: 100%
裝飾元素: 80-90%
浮水印: 20-30%
過渡效果: 動態變化
```

---

### 8. 遮罩

**類型:** `string`  
**必填:** 否  
**可編輯:** 是

**說明:**  
圖層遮罩的設定資訊，可以是遮罩圖層名稱、遮罩檔案路徑或遮罩類型。

**格式範例:**
```
layer_mask_01               # 遮罩圖層名稱
masks/character_mask.png    # 遮罩檔案路徑
alpha                       # Alpha 遮罩
vector                      # 向量遮罩
clipping                    # 剪裁遮罩
none                        # 無遮罩
```

**遮罩類型:**

**Alpha 遮罩:**
```
使用灰階值決定透明度
黑色 (0) = 完全透明
白色 (255) = 完全不透明
```

**剪裁遮罩 (Clipping Mask):**
```
使用下方圖層的形狀作為遮罩
常用於文字效果、圖案填充
```

**向量遮罩:**
```
使用貝茲曲線定義遮罩形狀
適合精確形狀裁切
```

---

## 🎮 實際應用範例

### 範例 1: 遊戲 UI 按鈕

```json
{
  "id": "btn_start_game",
  "label": "開始遊戲按鈕",
  "metadata": {
    "function": "主選單互動按鈕",
    "description": "綠色圓角按鈕，包含發光效果\n尺寸: 200x60px",
    "psPosition": "(960, 800)",
    "enginePosition": "(0.5, 0.74)",
    "blendMode": "Normal",
    "opacity": 100,
    "mask": "none",
    "notes": "需要 hover 和 pressed 狀態變化"
  }
}
```

### 範例 2: 背景圖層

```json
{
  "id": "bg_main_scene",
  "label": "主場景背景",
  "metadata": {
    "function": "背景裝飾",
    "description": "天空漸層背景\n包含雲朵和遠山\n解析度: 1920x1080",
    "psPosition": "(960, 540)",
    "enginePosition": "(0, 0)",
    "blendMode": "Normal",
    "opacity": 100,
    "mask": "none"
  }
}
```

### 範例 3: 光效圖層

```json
{
  "id": "fx_glow_particle",
  "label": "發光粒子效果",
  "metadata": {
    "function": "視覺特效",
    "description": "白色發光粒子\n使用 Screen 模式疊加",
    "psPosition": "(500, 300)",
    "enginePosition": "(0.26, 0.28)",
    "blendMode": "Screen",
    "opacity": 80,
    "mask": "alpha",
    "notes": "需要動態透明度動畫"
  }
}
```

### 範例 4: 角色立繪

```json
{
  "id": "character_hero_01",
  "label": "主角立繪",
  "metadata": {
    "function": "角色顯示",
    "description": "主角全身立繪\n表情: 微笑\n服裝: 預設",
    "psPosition": "(1200, 540)",
    "enginePosition": "(0.625, 0.5)",
    "blendMode": "Normal",
    "opacity": 100,
    "mask": "clipping",
    "notes": "有 3 個表情變化圖層"
  }
}
```

## 🔧 工作流程建議

### 從 PSD 到引擎的流程

```
1. Photoshop 設計
   ├─ 設定圖層名稱 (節點名稱)
   ├─ 記錄圖層座標 (Photoshop 座標)
   ├─ 設定混合模式 (疊加模式)
   ├─ 調整透明度 (透明度)
   └─ 建立遮罩 (遮罩)
   ↓
2. 匯出資訊到樹狀圖
   ├─ 使用 PSD 解析器自動提取
   ├─ 或手動輸入各項屬性
   └─ 編輯並完善描述資訊
   ↓
3. 座標轉換
   ├─ 計算引擎座標 (引擎座標)
   ├─ 標記功能類型 (功能)
   └─ 添加實作備註 (備註)
   ↓
4. 引擎實作
   ├─ 根據樹狀圖屬性建立物件
   ├─ 套用混合模式和透明度
   ├─ 設定遮罩效果
   └─ 測試並調整
```

### 命名規範建議

```
圖層命名格式: [類型]_[名稱]_[狀態]

範例:
btn_start_normal        # 按鈕_開始_正常狀態
btn_start_hover         # 按鈕_開始_懸停狀態
btn_start_pressed       # 按鈕_開始_按下狀態
bg_scene_main           # 背景_場景_主要
ui_healthbar_fill       # UI_血條_填充
fx_particle_glow        # 特效_粒子_發光
char_hero_body          # 角色_英雄_身體
```

## 📊 座標系統對照表

### PSD → 不同引擎的座標轉換

**假設 PSD 畫布大小: 1920x1080**

| PSD 座標 | 標準化 (0-1) | Unity UI | Cocos2d-x | 說明 |
|----------|-------------|----------|-----------|------|
| (0, 0) | (0, 0) | 左上角 | 左下角 | 原點位置不同 |
| (960, 540) | (0.5, 0.5) | 中心 | 中心 | 畫面中心 |
| (1920, 1080) | (1, 1) | 右下角 | 右上角 | 對角 |

**轉換函數範例:**

```javascript
// PSD 轉標準化座標
function psdToNormalized(psX, psY, canvasWidth = 1920, canvasHeight = 1080) {
  return {
    x: psX / canvasWidth,
    y: psY / canvasHeight
  };
}

// PSD 轉 Cocos2d-x (Y軸反轉)
function psdToCocos(psX, psY, canvasHeight = 1080) {
  return {
    x: psX,
    y: canvasHeight - psY
  };
}

// 標準化座標轉像素座標
function normalizedToPixel(normX, normY, screenWidth, screenHeight) {
  return {
    x: normX * screenWidth,
    y: normY * screenHeight
  };
}
```

## ✅ 屬性檢查清單

在完成節點設定時，檢查以下項目：

- [ ] ID 已自動生成，格式正確
- [ ] 節點名稱清晰描述，無特殊字元
- [ ] 功能類型已標記（若適用）
- [ ] 描述資訊完整（包含尺寸、格式等）
- [ ] Photoshop 座標已記錄（若從 PSD 匯入）
- [ ] 引擎座標已計算並驗證
- [ ] 混合模式正確對應引擎支援的模式
- [ ] 透明度數值在 0-100 範圍內
- [ ] 遮罩資訊已填寫（若有使用遮罩）
- [ ] 備註包含實作注意事項

## 🎓 最佳實踐

### DO ✅

- 使用一致的命名規範
- 詳細記錄座標資訊
- 標記特殊的混合模式需求
- 在描述中包含尺寸和格式資訊
- 為複雜效果添加實作備註
- 定期同步 PSD 和樹狀圖資訊

### DON'T ❌

- 使用模糊不清的節點名稱
- 忽略座標轉換的精確度
- 假設引擎支援所有 Photoshop 混合模式
- 忘記記錄遮罩相關資訊
- 省略重要的設計意圖說明

## 📚 相關文檔

- [樹狀圖節點編輯功能](./tree-node-editing.md)
- [樹狀圖系統總覽](./tree-system-overview.md)
- [PSD 結構文檔](./psd_structure.md)
- [快速參考指南](./tree-quick-reference.md)

---

**文檔版本:** 1.0  
**最後更新:** 2025年10月8日  
**適用範圍:** Photoshop → 遊戲引擎工作流程
