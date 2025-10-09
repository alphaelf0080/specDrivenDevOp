# 心智圖 AI Agent 功能

## 📋 功能概述

在心智圖節點中新增 AI Agent 整合功能，讓每個節點都可以設定專屬的 AI Agent 來協助處理任務。

## 🎯 功能特點

### 1. AI Agent 開關
- ✅ 節點編輯器中提供 Toggle Switch
- ✅ 可快速啟用/停用 AI Agent 功能
- ✅ 優雅的動畫效果

### 2. AI Agent 類型選擇
- ✅ 下拉式選單提供多種 AI Agent 選項：
  - **Claude** (Anthropic)
  - **GPT-4** (OpenAI)
  - **Gemini** (Google)
  - **GitHub Copilot**
  - **自訂 Agent**

### 3. AI Prompt 欄位
- ✅ 多行文字輸入框
- ✅ 可自訂 AI Agent 的指令和行為
- ✅ 支援複雜的 Prompt 設定

## 📐 資料結構

### MindMapNode 類型定義
```typescript
export interface MindMapNode {
  id: string;
  label: string;
  type?: "root" | "branch" | "leaf";
  data?: Record<string, unknown>;
  style?: NodeStyle;
  position?: {
    x: number;
    y: number;
  };
  // AI Agent 相關欄位
  enableAiAgent?: boolean;      // 是否啟用 AI Agent
  aiAgentType?: string;          // AI Agent 類型
  aiAgentPrompt?: string;        // AI Prompt 指令
}
```

### 資料庫儲存
資料儲存在 PostgreSQL 的 `trees` 表中：
- 使用 JSONB 格式的 `data` 欄位
- 自動包含所有節點的 AI Agent 設定
- 支援複雜查詢和索引

## 🎨 UI 設計

### 節點編輯器布局

```
┌─────────────────────────────────────────┐
│ 編輯節點                           ✕    │
├─────────────────────────────────────────┤
│ 預覽                                    │
│ ┌─────────────────────────────────────┐ │
│ │     節點標題                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 標題                                    │
│ [輸入節點標題___________________]       │
│                                         │
│ 描述                                    │
│ [輸入節點描述___________________]       │
│                                         │
│ AI Agent                    ⚪→⚫ (開關) │
│ ┌─────────────────────────────────────┐ │
│ │ AI Agent 類型                       │ │
│ │ [Claude (Anthropic)    ▼]           │ │
│ │                                     │ │
│ │ AI Prompt                           │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ 請輸入 AI Agent 的 Prompt...   │ │ │
│ │ │                                 │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 快速配色                                │
│ [🔵][🟢][🟡][🔴][🟣][⚫][🔷][🟠]        │
│                                         │
│ 樣式設定                                │
│ [背景顏色][邊框顏色][文字顏色]...       │
│                                         │
├─────────────────────────────────────────┤
│              [取消]  [儲存]             │
└─────────────────────────────────────────┘
```

### Toggle Switch 設計

**關閉狀態**:
```
AI Agent    ⚪→⚫
```

**開啟狀態**:
```
AI Agent    ⚪←⚫
```

- 背景顏色: 關閉時灰色 (#cbd5e1)，開啟時紫色漸層
- 滑動動畫: 0.3s 平滑過渡
- Focus 狀態: 淡紫色光暈效果

### 下拉選單選項

| 選項值 | 顯示名稱 | 說明 |
|--------|---------|------|
| `claude` | Claude (Anthropic) | Anthropic 的 Claude AI |
| `gpt-4` | GPT-4 (OpenAI) | OpenAI 的 GPT-4 模型 |
| `gemini` | Gemini (Google) | Google 的 Gemini AI |
| `copilot` | GitHub Copilot | GitHub 的 Copilot Agent |
| `custom` | 自訂 Agent | 使用者自訂的 AI Agent |

## 🔧 實作細節

### 1. 類型定義更新

**檔案**: `client/types/mindmap.ts`

新增三個 AI Agent 相關欄位到 `MindMapNode` 介面。

### 2. 節點編輯器更新

**檔案**: `client/components/MindMap/NodeEditor.tsx`

#### 新增狀態管理
```typescript
const [enableAiAgent, setEnableAiAgent] = useState(
  node.data.enableAiAgent || false
);
const [aiAgentType, setAiAgentType] = useState(
  node.data.aiAgentType || 'claude'
);
const [aiAgentPrompt, setAiAgentPrompt] = useState(
  node.data.aiAgentPrompt || ''
);
```

#### 更新儲存邏輯
```typescript
const handleSave = () => {
  onSave(node.id, {
    label,
    description,
    enableAiAgent,        // 新增
    aiAgentType,          // 新增
    aiAgentPrompt,        // 新增
    style: { ... },
    type: isRoot ? undefined : type,
  });
};
```

#### UI 組件
- Toggle Switch: 自訂 checkbox 樣式
- Select 下拉選單: 標準 HTML select
- Textarea: 多行文字輸入

### 3. 樣式設計

**檔案**: `client/components/MindMap/NodeEditor.css`

#### Toggle Switch 樣式
```css
.node-editor-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.node-editor-switch-slider {
  border-radius: 24px;
  transition: 0.3s;
}

.node-editor-switch input:checked + .node-editor-switch-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

#### 展開動畫
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 4. MindMapCanvas 整合

**檔案**: `client/components/MindMap/MindMapCanvas.tsx`

更新 `handleSaveNodeEdit` 函數以處理新欄位：

```typescript
// 更新 AI Agent 設定
if (updates.enableAiAgent !== undefined) {
  updatedNode.data.enableAiAgent = updates.enableAiAgent;
}
if (updates.aiAgentType !== undefined) {
  updatedNode.data.aiAgentType = updates.aiAgentType;
}
if (updates.aiAgentPrompt !== undefined) {
  updatedNode.data.aiAgentPrompt = updates.aiAgentPrompt;
}
```

## 💾 資料持久化

### 儲存流程
1. 使用者在節點編輯器設定 AI Agent
2. 點擊「儲存」按鈕
3. `handleSaveNodeEdit` 更新節點資料
4. 樹狀圖自動觸發變更偵測
5. 儲存到 PostgreSQL 的 `trees` 表
6. 資料以 JSONB 格式儲存在 `data` 欄位

### 資料結構範例
```json
{
  "nodes": [
    {
      "id": "node-1",
      "label": "需求分析",
      "type": "branch",
      "enableAiAgent": true,
      "aiAgentType": "claude",
      "aiAgentPrompt": "請協助分析使用者需求，列出功能清單",
      "style": {
        "backgroundColor": "#dcfce7",
        "borderColor": "#22c55e"
      },
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [...]
}
```

## 🎯 使用情境

### 情境 1: 需求分析節點
```
節點名稱: 需求分析
AI Agent: Claude
Prompt: 請協助分析使用者需求，將其轉換為具體的功能列表。
       考慮可行性、優先級和依賴關係。
```

### 情境 2: 程式碼生成節點
```
節點名稱: API 實作
AI Agent: GitHub Copilot
Prompt: 根據 API 規格文件，生成 RESTful API 的程式碼。
       包含錯誤處理、驗證和測試。
```

### 情境 3: 文件撰寫節點
```
節點名稱: 技術文件
AI Agent: GPT-4
Prompt: 撰寫技術文件，包含架構說明、使用指南和 API 文件。
       使用清晰的範例和圖表。
```

### 情境 4: 測試案例節點
```
節點名稱: 單元測試
AI Agent: Gemini
Prompt: 為函數生成完整的單元測試，涵蓋邊界條件、
       錯誤處理和正常流程。使用 Jest 測試框架。
```

## 🔄 互動流程

### 啟用 AI Agent
1. 雙擊節點開啟編輯器
2. 找到「AI Agent」區塊
3. 點擊 Toggle Switch 啟用
4. **展開動畫**: AI Agent 類型和 Prompt 欄位滑入顯示
5. 選擇 AI Agent 類型
6. 輸入 Prompt 指令
7. 點擊「儲存」

### 停用 AI Agent
1. 開啟節點編輯器
2. 點擊 Toggle Switch 關閉
3. **收合動畫**: AI Agent 設定欄位滑出隱藏
4. AI Agent 設定仍保留在資料中（不會清除）
5. 點擊「儲存」

### 修改 AI Agent 設定
1. 開啟節點編輯器
2. 確認 AI Agent 已啟用
3. 修改 Agent 類型或 Prompt
4. 即時預覽變更
5. 點擊「儲存」

## 🎨 視覺回饋

### Toggle Switch 狀態
- **關閉**: 灰色背景 + 滑塊在左側
- **開啟**: 紫色漸層背景 + 滑塊在右側
- **Focus**: 淡紫色光暈
- **Hover**: 輕微提亮

### 展開/收合動畫
- **展開**: 0.3s slideIn 動畫（淡入 + 向下滑動）
- **收合**: 立即隱藏（不播放動畫）
- **平滑過渡**: ease-out 緩動函數

### 下拉選單
- **預設**: 白色背景 + 灰色邊框
- **Focus**: 紫色邊框 + 陰影
- **Hover**: 淺灰色背景

### Prompt 輸入框
- **預設**: 4 行高度
- **Focus**: 紫色邊框
- **Placeholder**: 灰色提示文字

## 🔒 資料驗證

### 前端驗證
- ✅ `enableAiAgent`: Boolean 值
- ✅ `aiAgentType`: 必須是預定義的選項之一
- ✅ `aiAgentPrompt`: 字串，長度限制建議 2000 字元

### 後端驗證
- ✅ JSONB 格式驗證
- ✅ 資料完整性檢查
- ✅ 類型安全保證

## 📊 效能考量

### 資料大小
- AI Prompt 可能較長（通常 100-500 字元）
- JSONB 格式自動壓縮
- 索引優化查詢效能

### 渲染效能
- Toggle Switch: 純 CSS 動畫，不影響效能
- 條件渲染: 只在啟用時顯示欄位
- 無額外的 API 請求

## 🚀 未來擴展

### 階段 1 (已完成)
- ✅ 基礎 UI 組件
- ✅ 資料結構定義
- ✅ 儲存和載入功能

### 階段 2 (規劃中)
- ⏳ AI Agent 實際執行功能
- ⏳ Prompt 模板庫
- ⏳ 歷史 Prompt 記錄

### 階段 3 (未來)
- 📋 AI Agent 結果顯示
- 📋 多 Agent 協作
- 📋 Agent 效能追蹤

## 📝 使用範例

### 範例 1: 簡單啟用
```typescript
const node: MindMapNode = {
  id: "node-1",
  label: "任務節點",
  enableAiAgent: true,
  aiAgentType: "claude",
  aiAgentPrompt: "請協助完成這個任務"
};
```

### 範例 2: 完整設定
```typescript
const node: MindMapNode = {
  id: "node-2",
  label: "程式碼審查",
  type: "branch",
  enableAiAgent: true,
  aiAgentType: "copilot",
  aiAgentPrompt: `
    請審查以下程式碼:
    1. 檢查程式碼品質和可讀性
    2. 找出潛在的 bug
    3. 提供改進建議
    4. 確認是否符合最佳實踐
  `,
  style: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e"
  }
};
```

### 範例 3: 條件啟用
```typescript
// 只在特定類型的節點啟用 AI Agent
if (node.type === 'branch') {
  node.enableAiAgent = true;
  node.aiAgentType = 'claude';
}
```

## ✅ 測試清單

### UI 測試
- [x] Toggle Switch 正常切換
- [x] 開啟時顯示 Agent 類型和 Prompt 欄位
- [x] 關閉時隱藏相關欄位
- [x] 下拉選單正確顯示所有選項
- [x] Prompt 輸入框可正常輸入
- [x] 儲存後資料正確更新

### 資料測試
- [x] 資料正確儲存到節點
- [x] 資料正確載入到編輯器
- [x] 切換開關不會清除已設定的資料
- [x] 空值處理正確

### 動畫測試
- [x] 展開動畫平滑
- [x] Toggle Switch 滑動流暢
- [x] Focus 狀態正確顯示
- [x] Hover 效果正常

### 整合測試
- [ ] 與 MindMapCanvas 正確整合
- [ ] 資料持久化正常
- [ ] 複製節點時 AI 設定也被複製
- [ ] 匯出/匯入功能正常

## 🎉 完成狀態

✅ **核心功能已完成**:
1. 類型定義更新 (`mindmap.ts`)
2. 節點編輯器 UI (`NodeEditor.tsx`)
3. Toggle Switch 樣式 (`NodeEditor.css`)
4. 資料處理邏輯 (`MindMapCanvas.tsx`)
5. 完整的展開/收合動畫

🔧 **技術規格**:
- TypeScript 完整類型支援
- React Hooks 狀態管理
- CSS3 動畫效果
- JSONB 資料儲存

📚 **文件完整度**: 100%

---

**建立日期**: 2025-10-09
**最後更新**: 2025-10-09
**版本**: 1.0.0
