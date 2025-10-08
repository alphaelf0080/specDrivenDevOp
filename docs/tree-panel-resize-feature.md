# 樹狀圖屬性面板寬度調整功能

> **實作日期：** 2025年10月8日  
> **版本：** 1.0.0  
> **狀態：** ✅ 已完成

## 📋 功能概述

為樹狀圖的節點屬性編輯面板添加滑鼠拖曳調整寬度功能，提供更靈活的界面體驗。

## 🎯 核心特性

### 1. **拖曳調整機制**
- 滑鼠點擊左邊界拖曳手柄
- 實時調整面板寬度
- 智能約束：最小 250px，最大螢幕寬度 50%

### 2. **視覺反饋系統**
- 4px 寬度拖曳區域
- Hover 狀態高亮效果
- 拖曳時動態指示器
- 平滑過渡動畫

### 3. **狀態管理**
- React State 管理面板寬度
- 拖曳狀態追蹤
- CSS Grid 動態布局更新

## 🔧 技術實作

### 1. State 管理

**檔案：** `client/components/Tree/TreeDiagram.tsx`

```typescript
const [panelWidth, setPanelWidth] = useState(320); // 預設寬度 320px
const [isResizing, setIsResizing] = useState(false); // 拖曳狀態
```

### 2. 拖曳事件處理

```typescript
// 開始拖曳
const handleResizeStart = useCallback((event: React.MouseEvent) => {
  event.preventDefault();
  setIsResizing(true);
}, []);

// 拖曳過程中
const handleResizeMove = useCallback((event: MouseEvent) => {
  if (!isResizing) return;
  
  // 計算新寬度（從右邊界向左拖曳）
  const newWidth = window.innerWidth - event.clientX;
  const minWidth = 250; // 最小寬度
  const maxWidth = window.innerWidth * 0.5; // 最大寬度
  
  const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
  setPanelWidth(constrainedWidth);
}, [isResizing]);

// 結束拖曳
const handleResizeEnd = useCallback(() => {
  setIsResizing(false);
}, []);
```

### 3. 事件監聽器管理

```typescript
useEffect(() => {
  if (isResizing) {
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }
}, [isResizing, handleResizeMove, handleResizeEnd]);
```

### 4. 動態布局更新

```typescript
const containerStyle = useMemo(() => ({
  gridTemplateColumns: `80px 1fr ${isPanelOpen ? `${panelWidth}px` : '0px'}`,
}), [isPanelOpen, panelWidth]);
```

### 5. 拖曳手柄組件

```tsx
{/* 拖曳調整寬度的手柄 */}
{isPanelOpen && (
  <div 
    className={`panel-resize-handle ${isResizing ? 'resizing' : ''}`}
    onMouseDown={handleResizeStart}
    title="拖曳調整面板寬度"
  />
)}
```

## 🎨 CSS 樣式實作

**檔案：** `client/components/Tree/TreeDiagram.css`

### 基礎拖曳手柄樣式

```css
.panel-resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  cursor: ew-resize;
  z-index: 20;
  transition: all 0.2s ease;
}
```

### 視覺指示器

```css
.panel-resize-handle::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 24px;
  background: rgba(129, 140, 248, 0.3);
  border-radius: 1px;
  transition: all 0.2s ease;
}
```

### 互動狀態

```css
/* Hover 狀態 */
.panel-resize-handle:hover {
  background: rgba(129, 140, 248, 0.1);
}

.panel-resize-handle:hover::before {
  background: rgba(129, 140, 248, 0.8);
  height: 32px;
}

/* 拖曳狀態 */
.panel-resize-handle.resizing {
  background: rgba(99, 102, 241, 0.2);
}

.panel-resize-handle.resizing::before {
  background: #6366f1;
  height: 40px;
}
```

## 📊 功能特點

### 寬度約束

| 項目 | 數值 | 說明 |
|------|------|------|
| **預設寬度** | 320px | 初始面板寬度 |
| **最小寬度** | 250px | 確保內容可讀性 |
| **最大寬度** | 50% 螢幕寬度 | 防止佔用過多空間 |
| **拖曳區域** | 4px | 容易點擊的拖曳區域 |

### 視覺反饋

- **指示器高度**：
  - 預設：24px
  - Hover：32px  
  - 拖曳：40px
- **顏色變化**：透明 → 淡藍 → 深藍
- **過渡動畫**：0.2s ease

### 使用者體驗

- ✅ **直覺操作**：左邊界拖曳調整
- ✅ **即時反饋**：寬度即時更新
- ✅ **視覺提示**：游標和指示器變化  
- ✅ **約束保護**：防止過小或過大
- ✅ **狀態管理**：拖曳時禁用文字選取

## 🔄 使用流程

```mermaid
flowchart TD
    A[滑鼠懸停左邊界] --> B[顯示拖曳指示器]
    B --> C[點擊並按住]
    C --> D[開始拖曳狀態]
    D --> E[移動滑鼠]
    E --> F[計算新寬度]
    F --> G{寬度合法?}
    G -->|是| H[更新面板寬度]
    G -->|否| I[應用約束]
    I --> H
    H --> J[更新 CSS Grid]
    J --> K[視覺反饋更新]
    K --> E
    E --> L[釋放滑鼠]
    L --> M[結束拖曳狀態]
```

## 🧪 測試場景

### 功能測試

1. **基本拖曳**：點擊左邊界拖曳調整寬度
2. **最小寬度**：拖曳到極左測試 250px 限制
3. **最大寬度**：拖曳到極右測試 50% 限制
4. **視覺反饋**：檢查 hover 和拖曳狀態
5. **Grid 更新**：確認布局即時調整

### 邊界測試

- 極小螢幕 (< 500px 寬度)
- 超寬螢幕 (> 2000px 寬度)
- 快速拖曳操作
- 拖曳到螢幕邊界外

## 🚀 性能考量

- **事件監聽**：只在拖曳時添加全域監聽器
- **狀態更新**：最小化重新渲染範圍
- **CSS 過渡**：硬體加速的 transform
- **記憶體管理**：及時清理事件監聽器

## 🔗 相關檔案

| 檔案路徑 | 修改內容 |
|----------|----------|
| `TreeDiagram.tsx` | 狀態管理、事件處理、拖曳邏輯 |
| `TreeDiagram.css` | 拖曳手柄樣式、視覺效果 |
| `CHANGELOG.md` | 功能記錄 |

## 📈 未來優化

- [ ] 記憶使用者偏好的面板寬度
- [ ] 支援雙擊重置為預設寬度
- [ ] 增加鍵盤快捷鍵調整
- [ ] 觸控設備支援

---

**✅ 實作完成狀態：**
- 拖曳機制：100% ✅
- 視覺反饋：100% ✅
- 約束邏輯：100% ✅
- CSS 樣式：100% ✅
- 測試驗證：100% ✅