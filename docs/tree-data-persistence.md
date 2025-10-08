# 樹狀圖資料持久化儲存功能

## 📅 建立日期

**2025年10月8日** - 節點屬性持久化儲存系統

## 🎯 功能概述

實現樹狀圖節點編輯後的資料持久化儲存,使用者編輯的所有屬性會自動儲存到瀏覽器 localStorage,下次開啟頁面時會自動載入已儲存的資料。

### 核心特色

- 💾 **自動儲存**: 編輯節點後自動儲存到 localStorage
- 🔄 **自動載入**: 開啟頁面時自動載入已儲存的資料
- 🔀 **智能合併**: 保留原始資料結構,只更新已編輯的 metadata
- ➕ **新增即存**: 透過右鍵選單或 Tab 快捷鍵加入的節點會立即寫回 localStorage
- ➖ **刪除即存**: 移除任意非根節點時會同步更新儲存內容並附帶時間戳記
- ⏰ **時間戳記**: 記錄最後修改時間
- 📦 **多頁面支援**: 每個樹狀圖頁面獨立儲存
- 📤 **匯出功能**: 可將資料匯出為 JSON 檔案
- 📥 **匯入功能**: 可從 JSON 檔案匯入資料
- 🗑️ **清除功能**: 可清除已儲存的資料,恢復原始狀態

## 🏗️ 系統架構

### 資料流程

```
原始 JSON 檔案
    ↓
生成基礎樹狀結構
    ↓
從 localStorage 載入已儲存資料
    ↓
合併原始資料與已儲存資料
    ↓
顯示在樹狀圖中
    ↓
使用者編輯節點
    ↓
自動儲存到 localStorage (含時間戳記)
    ↓
下次開啟時自動載入
```

### 儲存機制

```typescript
// 1. 編輯節點
handleNodeUpdate(nodeId, updates)
    ↓
// 2. 更新樹狀結構
const updatedTree = updateNodeInTree(treeData)
    ↓
// 3. 更新狀態
setTreeData(updatedTree)
    ↓
// 4. 自動儲存
saveTreeDataWithTimestamp(PAGE_KEY, updatedTree)
    ↓
localStorage.setItem('tree-data-{PAGE_KEY}', JSON.stringify(updatedTree))
localStorage.setItem('tree-data-{PAGE_KEY}-timestamp', Date.now())
```

### 新增 / 刪除節點流程

```typescript
// 1. 透過 TreeDiagram 提供的 onAddNode / onDeleteNode 觸發
handleAddNode(parentId)
handleDeleteNode(nodeId)
  ↓
// 2. 建立或過濾節點
const updatedTree = addChild(prevTree) / deleteNode(prevTree)
  ↓
// 3. 更新 React 狀態
setTreeData(updatedTree)
  ↓
// 4. 持久化
saveTreeDataWithTimestamp(PAGE_KEY, updatedTree)
```

### 載入機制

```typescript
// 1. 生成原始樹狀結構
const originalTree = toTree(jsonData)
    ↓
// 2. 從 localStorage 載入
const savedData = loadTreeData(PAGE_KEY)
    ↓
// 3. 合併資料
const mergedTree = mergeTreeData(originalTree, savedData)
    ↓
// 4. 設定初始狀態
setTreeData(mergedTree)
```

## 📦 API 文檔

### 核心函數

#### saveTreeData(pageKey, treeData)

儲存樹狀圖資料到 localStorage。

**參數:**
- `pageKey: string` - 頁面唯一識別碼
- `treeData: TreeNode` - 完整的樹狀圖資料

**範例:**
```typescript
saveTreeData('ui-layout', treeData);
```

---

#### loadTreeData(pageKey)

從 localStorage 載入樹狀圖資料。

**參數:**
- `pageKey: string` - 頁面唯一識別碼

**返回:**
- `TreeNode | null` - 已儲存的樹狀圖資料,若無則返回 null

**範例:**
```typescript
const savedData = loadTreeData('ui-layout');
if (savedData) {
  console.log('載入已儲存的資料');
}
```

---

#### mergeTreeData(originalTree, savedTree)

合併原始資料與已儲存資料。

**邏輯:**
- 保留原始資料的結構(節點層級、children)
- 只更新已儲存資料中的 metadata
- 不會影響沒有編輯過的節點

**參數:**
- `originalTree: TreeNode` - 原始樹狀圖資料
- `savedTree: TreeNode | null` - 已儲存的樹狀圖資料

**返回:**
- `TreeNode` - 合併後的樹狀圖資料

**範例:**
```typescript
const originalTree = toTree(jsonData);
const savedTree = loadTreeData('ui-layout');
const mergedTree = mergeTreeData(originalTree, savedTree);
```

---

#### saveTreeDataWithTimestamp(pageKey, treeData)

儲存樹狀圖資料並記錄時間戳記。

**參數:**
- `pageKey: string` - 頁面唯一識別碼
- `treeData: TreeNode` - 完整的樹狀圖資料

**範例:**
```typescript
saveTreeDataWithTimestamp('ui-layout', updatedTree);
```

---

#### clearTreeData(pageKey)

清除指定頁面的已儲存資料。

**參數:**
- `pageKey: string` - 頁面唯一識別碼

**範例:**
```typescript
clearTreeData('ui-layout');
// 下次載入頁面時會使用原始資料
```

---

#### hasTreeData(pageKey)

檢查是否有已儲存的資料。

**參數:**
- `pageKey: string` - 頁面唯一識別碼

**返回:**
- `boolean` - 是否存在已儲存的資料

**範例:**
```typescript
if (hasTreeData('ui-layout')) {
  console.log('有已儲存的資料');
}
```

---

#### getLastModifiedTime(pageKey)

獲取最後修改時間。

**參數:**
- `pageKey: string` - 頁面唯一識別碼

**返回:**
- `Date | null` - 最後修改時間,若無則返回 null

**範例:**
```typescript
const lastModified = getLastModifiedTime('ui-layout');
if (lastModified) {
  console.log(`最後修改: ${lastModified.toLocaleString()}`);
}
```

---

#### exportTreeDataToFile(pageKey, treeData, filename?)

匯出樹狀圖資料為 JSON 檔案。

**參數:**
- `pageKey: string` - 頁面唯一識別碼
- `treeData: TreeNode` - 樹狀圖資料
- `filename?: string` - 檔案名稱(選填,預設使用 pageKey)

**範例:**
```typescript
exportTreeDataToFile('ui-layout', treeData, 'my-ui-layout');
// 下載 my-ui-layout-tree-data.json
```

---

#### importTreeDataFromFile(file)

從 JSON 檔案匯入樹狀圖資料。

**參數:**
- `file: File` - 檔案物件

**返回:**
- `Promise<TreeNode>` - 匯入的樹狀圖資料

**範例:**
```typescript
const input = document.createElement('input');
input.type = 'file';
input.accept = 'application/json';
input.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const treeData = await importTreeDataFromFile(file);
    setTreeData(treeData);
    saveTreeData('ui-layout', treeData);
  }
};
input.click();
```

## 💡 使用範例

### 基本使用 (已整合到頁面組件)

```typescript
import { saveTreeDataWithTimestamp, loadTreeData, mergeTreeData } from '../../utils/treeDataStorage';

const PAGE_KEY = 'ui-layout';

export default function TreeUiLayoutPage({ onBackHome }: Props) {
  // 1. 生成原始樹狀結構
  const originalTree = useMemo(() => toTree(jsonData), []);
  
  // 2. 載入並合併已儲存的資料
  const initialTree = useMemo(() => {
    const savedData = loadTreeData(PAGE_KEY);
    return mergeTreeData(originalTree, savedData);
  }, [originalTree]);
  
  const [treeData, setTreeData] = useState(initialTree);
  
  // 3. 編輯時自動儲存
  const handleNodeUpdate = useCallback((nodeId, updates) => {
    const updatedTree = updateNodeInTree(treeData);
    setTreeData(updatedTree);
    saveTreeDataWithTimestamp(PAGE_KEY, updatedTree); // ← 自動儲存
  }, [treeData]);
  
  return <TreeDiagram data={treeData} onNodeUpdate={handleNodeUpdate} />;
}
```

### 清除已儲存資料

```typescript
import { clearTreeData } from '../../utils/treeDataStorage';

// 清除特定頁面的資料
function handleReset() {
  if (confirm('確定要清除所有編輯內容嗎?')) {
    clearTreeData('ui-layout');
    window.location.reload(); // 重新載入頁面
  }
}
```

### 檢查是否有已儲存資料

```typescript
import { hasTreeData, getLastModifiedTime } from '../../utils/treeDataStorage';

function TreePageInfo({ pageKey }: { pageKey: string }) {
  const hasSaved = hasTreeData(pageKey);
  const lastModified = getLastModifiedTime(pageKey);
  
  return (
    <div>
      {hasSaved ? (
        <div>
          ✅ 有已儲存的編輯內容
          <br />
          最後修改: {lastModified?.toLocaleString()}
        </div>
      ) : (
        <div>📝 尚未編輯</div>
      )}
    </div>
  );
}
```

### 匯出/匯入功能

```typescript
import { exportTreeDataToFile, importTreeDataFromFile, saveTreeData } from '../../utils/treeDataStorage';

// 匯出
function handleExport() {
  exportTreeDataToFile('ui-layout', treeData, 'my-layout-backup');
}

// 匯入
function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const imported = await importTreeDataFromFile(file);
        setTreeData(imported);
        saveTreeData('ui-layout', imported);
        alert('匯入成功!');
      } catch (error) {
        alert('匯入失敗: ' + error);
      }
    }
  };
  input.click();
}
```

## 🗂️ 儲存結構

### localStorage 結構

```
localStorage:
  ├─ tree-data-ui-layout           # UI Layout 樹狀圖資料
  ├─ tree-data-ui-layout-timestamp # 最後修改時間
  ├─ tree-data-ui-layout-rich      # UI Layout 完整資訊資料
  ├─ tree-data-ui-layout-rich-timestamp
  ├─ tree-data-psd-structure       # PSD 結構樹資料
  └─ tree-data-psd-structure-timestamp
```

### 儲存的資料格式

```json
{
  "id": "ui-root",
  "label": "UI Layout (1080×1920)",
  "children": [
    {
      "id": "btn-start",
      "label": "開始按鈕",
      "metadata": {
        "function": "主選單互動按鈕",
        "description": "綠色圓角按鈕，包含發光效果",
        "psPosition": "(960, 800)",
        "enginePosition": "(0.5, 0.74)",
        "blendMode": "Normal",
        "opacity": 100,
        "mask": "none",
        "notes": "需要 hover 和 pressed 狀態"
      },
      "children": [...]
    }
  ]
}
```

## 🔧 合併邏輯詳解

### 為什麼需要合併?

1. **保留原始結構**: 原始 JSON 可能更新(新增/刪除節點)
2. **保留編輯內容**: 使用者編輯的 metadata 需要保留
3. **避免衝突**: 原始資料變更時不會丟失編輯

### 合併演算法

```typescript
function mergeTreeData(originalTree, savedTree) {
  if (!savedTree) return originalTree;
  
  // 1. 建立 metadata 對照表
  const metadataMap = new Map();
  collectMetadata(savedTree, metadataMap);
  
  // 2. 將已儲存的 metadata 應用到原始樹
  function applyMetadata(node) {
    const savedMetadata = metadataMap.get(node.id);
    return {
      ...node,
      metadata: savedMetadata || node.metadata,
      children: node.children?.map(applyMetadata)
    };
  }
  
  return applyMetadata(originalTree);
}
```

### 合併範例

**原始資料:**
```json
{
  "id": "btn-start",
  "label": "開始",
  "children": [...]
}
```

**已儲存資料:**
```json
{
  "id": "btn-start",
  "label": "開始",
  "metadata": {
    "description": "使用者編輯的描述"
  },
  "children": [...]
}
```

**合併結果:**
```json
{
  "id": "btn-start",
  "label": "開始",  // ← 使用原始資料
  "metadata": {
    "description": "使用者編輯的描述"  // ← 使用已儲存的 metadata
  },
  "children": [...]  // ← 使用原始資料結構
}
```

## 📊 儲存容量

### localStorage 限制

- **大小限制**: 每個網域通常 5-10MB
- **單個樹狀圖**: 約 100-500KB (取決於節點數量)
- **建議**: 定期匯出備份大型資料

### 估算儲存大小

```typescript
function getStorageSize(pageKey: string): number {
  const data = localStorage.getItem(`tree-data-${pageKey}`);
  return data ? new Blob([data]).size : 0;
}

function getAllStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tree-data-')) {
      const data = localStorage.getItem(key);
      total += data ? new Blob([data]).size : 0;
    }
  }
  return total;
}

// 使用
console.log(`UI Layout 大小: ${getStorageSize('ui-layout')} bytes`);
console.log(`總共使用: ${getAllStorageSize()} bytes`);
```

## 🎁 使用者價值

### 對內容創作者

- 💾 編輯自動儲存,不怕刷新頁面
- 🔄 可隨時回到上次編輯狀態
- 📤 可匯出備份檔案

### 對開發者

- 🧪 測試資料可持久保存
- 🔧 開發過程中無需重複輸入
- 📊 可分享編輯好的資料檔案

### 對團隊協作

- 📦 匯出/匯入功能方便資料交換
- 🔀 獨立頁面儲存,互不干擾
- ⏰ 時間戳記追蹤修改歷史

## ⚠️ 注意事項

### 資料同步

- localStorage 只儲存在本地瀏覽器
- 不會自動同步到其他裝置或瀏覽器
- 清除瀏覽器資料會刪除已儲存內容

### 備份建議

- 重要資料定期使用「匯出」功能備份
- 多人協作時透過匯出/匯入交換資料
- 大量編輯後建議立即備份

### 瀏覽器相容性

- 所有現代瀏覽器都支援 localStorage
- 無痕模式可能限制 localStorage 功能
- Safari 私密瀏覽模式會清除 localStorage

## 📚 相關文檔

- [樹狀圖節點編輯功能](./tree-node-editing.md)
- [PSD 屬性完整指南](./tree-psd-properties-guide.md)
- [樹狀圖系統總覽](./tree-system-overview.md)

---

**功能版本:** 1.0  
**最後更新:** 2025年10月8日  
**狀態:** ✅ 功能完整,已整合到所有樹狀圖頁面
