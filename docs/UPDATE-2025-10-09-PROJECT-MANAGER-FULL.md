# 專案管理視窗完整功能實作完成

**更新日期**: 2025年10月9日  
**功能**: 專案管理視窗 - 完整的專案 CRUD 功能

---

## 📋 功能概述

實現完整的專案管理視窗，包含：
- ✅ 顯示資料庫中所有專案
- ✅ 多種排序方式
- ✅ 新建專案
- ✅ 編輯專案資訊
- ✅ 刪除專案（軟刪除）

---

## ✅ 已完成功能

### 1. 專案列表顯示

**功能特點**:
- 表格形式顯示專案列表
- 顯示欄位：名稱、遊戲類型、狀態、建立時間、更新時間
- 空狀態提示
- 載入動畫
- 錯誤處理

**視覺效果**:
```
┌────────────────────────────────────────────────────────────────┐
│  📊 專案管理視窗                                  [✕]           │
├────────────────────────────────────────────────────────────────┤
│  [➕ 新建專案]         排序：[名稱 ▼] [↓]    共 5 個專案       │
├────────────────────────────────────────────────────────────────┤
│  名稱         遊戲類型  狀態    建立時間    更新時間  操作    │
│  ────────────────────────────────────────────────────────────  │
│  專案 A       Slot    Active   2025-10-09  2025-10-09  [✏️][🗑️] │
│  專案 B       Card    Active   2025-10-08  2025-10-09  [✏️][🗑️] │
│  專案 C       Table   Draft    2025-10-07  2025-10-07  [✏️][🗑️] │
└────────────────────────────────────────────────────────────────┘
```

### 2. 排序功能

**支援排序欄位**:
- 名稱 (name)
- 建立時間 (created_at)
- 更新時間 (updated_at)
- 狀態 (status)
- 遊戲類型 (game_type)

**排序方式**:
- ↑ 升序 (asc)
- ↓ 降序 (desc)
- 點擊標題列切換排序
- 點擊排序按鈕切換順序

### 3. 新建專案

**表單欄位**:
- **專案名稱*** (name) - 必填
- **中文名稱*** (name_zh) - 必填
- **英文名稱*** (name_en) - 必填
- **遊戲類型*** (game_type) - 必填
- **狀態** (status) - 下拉選單：Active / Archived / Draft
- **專案描述** (description) - 選填，多行文字

**操作流程**:
1. 點擊「➕ 新建專案」按鈕
2. 填寫表單資料
3. 點擊「儲存」提交
4. 自動刷新列表

### 4. 編輯專案

**功能特點**:
- 點擊表格中的 ✏️ 按鈕開啟編輯
- 表單預填現有資料
- 支援修改所有欄位
- 即時更新顯示

### 5. 刪除專案

**安全機制**:
- 軟刪除（設定 deleted_at）
- 刪除前確認對話框
- 無法復原警告
- 確認後自動刷新列表

**確認對話框**:
```
┌──────────────────────────┐
│       ⚠️                 │
│    確認刪除              │
│                          │
│  確定要刪除此專案嗎？     │
│  此操作無法復原。         │
│                          │
│  [取消]  [確認刪除]      │
└──────────────────────────┘
```

---

## 📁 檔案結構

### 前端組件

**client/components/ProjectManager/ProjectManager.tsx** (~500 行)
- 主要組件邏輯
- 狀態管理
- API 呼叫
- 排序邏輯
- 表單處理

**client/components/ProjectManager/ProjectManager.css** (~600 行)
- 完整樣式定義
- 響應式設計
- 動畫效果
- 主題色彩

### 後端 API

**server/routes/projects.ts** (~300 行)
- RESTful API 端點
- CRUD 操作
- 錯誤處理
- 資料驗證

**API 端點**:
```
GET    /api/projects        - 獲取所有專案
GET    /api/projects/:id    - 獲取單一專案
POST   /api/projects        - 創建新專案
PUT    /api/projects/:id    - 更新專案
DELETE /api/projects/:id    - 刪除專案（軟刪除）
DELETE /api/projects/:id/permanent - 永久刪除
```

### 路由配置

**server/index.ts**
- 引入 projectsRouter
- 掛載到 `/api/projects`

**client/App.tsx**
- 引入 ProjectManager 組件
- project-manager 路由處理

---

## 🎨 視覺設計

### 色彩方案

**主色調**:
- 紫色漸層: `#667eea` → `#764ba2` (標題列)
- 綠色: `#48bb78` (新建按鈕、成功狀態)
- 紅色: `#e53e3e` (刪除按鈕、錯誤)
- 灰色: `#f7fafc` (背景、工具列)

**狀態徽章**:
- Active: 綠色 `#c6f6d5` / `#22543d`
- Archived: 紅色 `#fed7d7` / `#742a2a`
- Draft: 青色 `#e6fffa` / `#234e52`

### 互動效果

**按鈕動畫**:
```css
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

**載入動畫**:
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**表格 hover**:
```css
tr:hover {
  background: #f7fafc;
  transition: background 0.2s;
}
```

---

## 🔧 技術實作

### 前端架構

**狀態管理**:
```typescript
interface Project {
  id: number;
  name: string;
  name_zh: string;
  name_en: string;
  game_type: string;
  description: string | null;
  status: string;
  owner_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// 狀態
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [sortField, setSortField] = useState<SortField>('created_at');
const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
```

**排序邏輯**:
```typescript
const sortedProjects = [...projects].sort((a, b) => {
  let aValue: any = a[sortField];
  let bValue: any = b[sortField];

  // 處理日期
  if (sortField === 'created_at' || sortField === 'updated_at') {
    aValue = new Date(aValue).getTime();
    bValue = new Date(bValue).getTime();
  }

  // 處理字串
  if (typeof aValue === 'string') aValue = aValue.toLowerCase();
  if (typeof bValue === 'string') bValue = bValue.toLowerCase();

  if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
  if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
  return 0;
});
```

### 後端架構

**資料驗證**:
```typescript
// 驗證必填欄位
if (!name || !name_zh || !name_en || !game_type) {
  return res.status(400).json({
    success: false,
    error: '缺少必填欄位',
    required: ['name', 'name_zh', 'name_en', 'game_type'],
  });
}
```

**SQL 查詢**:
```typescript
// 創建專案
const result = await db.query(
  `INSERT INTO projects (
    name, name_zh, name_en, game_type, description, status, owner_id
  ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *`,
  [name, name_zh, name_en, game_type, description || null, status, owner_id || null]
);

// 軟刪除
const result = await db.query(
  `UPDATE projects 
   SET deleted_at = CURRENT_TIMESTAMP
   WHERE id = $1
   RETURNING *`,
  [id]
);
```

---

## 🧪 測試指南

### 1. 基本功能測試

**開啟專案管理視窗**:
1. 訪問 http://localhost:5030
2. 點擊專案區塊右上角「專案管理視窗」按鈕
3. 應顯示專案管理視窗

**查看專案列表**:
- 如果有專案：顯示表格
- 如果沒有專案：顯示空狀態提示
- 載入中：顯示 spinner 動畫

### 2. 新建專案測試

**測試步驟**:
```
1. 點擊「➕ 新建專案」
2. 填寫表單：
   - 專案名稱: TestProject
   - 中文名稱: 測試專案
   - 英文名稱: Test Project
   - 遊戲類型: Slot
   - 狀態: Active
   - 描述: 這是一個測試專案
3. 點擊「儲存」
4. 檢查列表中是否出現新專案
```

**預期結果**:
- ✅ 表單成功提交
- ✅ 列表自動刷新
- ✅ 新專案出現在列表中
- ✅ 專案數量增加

### 3. 編輯專案測試

**測試步驟**:
```
1. 點擊任一專案的 ✏️ 按鈕
2. 修改專案資訊（例如改變狀態）
3. 點擊「儲存」
4. 檢查列表中的資料是否更新
```

**預期結果**:
- ✅ 表單預填現有資料
- ✅ 修改成功儲存
- ✅ 列表顯示更新後的資料
- ✅ updated_at 時間更新

### 4. 刪除專案測試

**測試步驟**:
```
1. 點擊任一專案的 🗑️ 按鈕
2. 確認對話框出現
3. 點擊「確認刪除」
4. 檢查專案是否從列表中消失
```

**預期結果**:
- ✅ 顯示確認對話框
- ✅ 刪除成功
- ✅ 列表自動刷新
- ✅ 專案數量減少

### 5. 排序功能測試

**測試步驟**:
```
1. 點擊不同的排序欄位下拉選單
2. 點擊排序順序按鈕（↑/↓）
3. 觀察列表排序變化
```

**預期結果**:
- ✅ 列表按選定欄位排序
- ✅ 升序/降序正確切換
- ✅ 點擊表格標題也能排序

### 6. 錯誤處理測試

**測試情境**:
- 網路中斷時嘗試載入
- 提交空表單
- 刪除不存在的專案

**預期結果**:
- ✅ 顯示錯誤訊息
- ✅ 提供重試按鈕
- ✅ 不會崩潰

---

## 💡 使用說明

### 開啟專案管理視窗

**方法一：首頁按鈕**
1. 開啟首頁 http://localhost:5030
2. 點擊專案區塊右上角「專案管理視窗」

**方法二：直接 URL**
```
http://localhost:5030/?view=project-manager
```

### 新建專案

1. 點擊「➕ 新建專案」
2. 填寫所有必填欄位（標記 *）
3. 選擇專案狀態
4. 輸入專案描述（選填）
5. 點擊「儲存」

### 編輯專案

1. 找到要編輯的專案
2. 點擊該行的 ✏️ 按鈕
3. 修改需要更新的欄位
4. 點擊「儲存」

### 刪除專案

1. 找到要刪除的專案
2. 點擊該行的 🗑️ 按鈕
3. 在確認對話框中點擊「確認刪除」

### 排序專案

**方法一：下拉選單**
1. 點擊「排序」下拉選單
2. 選擇排序欄位
3. 點擊排序順序按鈕切換升降序

**方法二：點擊標題**
1. 直接點擊表格標題列
2. 再次點擊切換升降序

---

## 📊 資料庫結構

### projects 表結構

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_zh VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  game_type VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  owner_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_name ON projects(name);
```

### 欄位說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| id | SERIAL | ✅ | 主鍵，自動遞增 |
| name | VARCHAR(255) | ✅ | 專案名稱 |
| name_zh | VARCHAR(255) | ✅ | 中文名稱 |
| name_en | VARCHAR(255) | ✅ | 英文名稱 |
| game_type | VARCHAR(255) | ✅ | 遊戲類型 |
| description | TEXT | ❌ | 專案描述 |
| status | VARCHAR(50) | ❌ | 專案狀態，預設 'active' |
| owner_id | INTEGER | ❌ | 擁有者 ID |
| created_at | TIMESTAMP | ✅ | 建立時間 |
| updated_at | TIMESTAMP | ❌ | 更新時間 |
| deleted_at | TIMESTAMP | ❌ | 刪除時間（軟刪除） |

---

## 🚀 API 使用範例

### 獲取所有專案

```bash
curl http://localhost:5010/api/projects
```

**回應**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "TestProject",
      "name_zh": "測試專案",
      "name_en": "Test Project",
      "game_type": "Slot",
      "description": "這是一個測試專案",
      "status": "active",
      "owner_id": null,
      "created_at": "2025-10-09T10:00:00Z",
      "updated_at": "2025-10-09T10:00:00Z",
      "deleted_at": null
    }
  ],
  "count": 1
}
```

### 創建新專案

```bash
curl -X POST http://localhost:5010/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NewProject",
    "name_zh": "新專案",
    "name_en": "New Project",
    "game_type": "Card",
    "description": "新的專案",
    "status": "active"
  }'
```

### 更新專案

```bash
curl -X PUT http://localhost:5010/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "archived"
  }'
```

### 刪除專案

```bash
curl -X DELETE http://localhost:5010/api/projects/1
```

---

## 🐛 疑難排解

### 問題：無法載入專案列表

**可能原因**:
- 資料庫未連線
- API 端點錯誤

**解決方法**:
1. 檢查資料庫是否正在運行：`brew services list | grep postgresql`
2. 檢查環境變數：`cat .env`
3. 重啟開發服務器：`npm run dev`

### 問題：新建專案失敗

**可能原因**:
- 必填欄位未填寫
- 資料格式錯誤

**解決方法**:
1. 確保所有必填欄位都已填寫
2. 檢查瀏覽器開發者工具的 Console 和 Network 標籤
3. 查看後端日誌

### 問題：排序不正確

**可能原因**:
- 資料類型錯誤
- 排序邏輯問題

**解決方法**:
1. 檢查 sortField 和 sortOrder 狀態
2. 確認資料類型轉換正確
3. 查看 sortedProjects 的結果

---

## 📈 效能優化

### 已實現的優化

1. **批次載入**: 一次性載入所有專案
2. **客戶端排序**: 排序在前端進行，減少 API 呼叫
3. **軟刪除**: 使用軟刪除保留資料歷史
4. **索引優化**: 在常用查詢欄位建立索引

### 未來優化方向

1. **分頁**: 專案數量過多時實現分頁
2. **搜尋**: 添加專案名稱搜尋功能
3. **篩選**: 按狀態、類型篩選
4. **快取**: 實現資料快取減少 API 呼叫
5. **虛擬滾動**: 大量資料時使用虛擬滾動

---

## 🎯 下一步開發

### 短期（1 週內）

- [ ] 添加搜尋功能
- [ ] 實現分頁
- [ ] 添加狀態篩選
- [ ] 批量操作

### 中期（2-4 週）

- [ ] 專案詳情頁面
- [ ] 專案與心智圖關聯
- [ ] 專案成員管理
- [ ] 專案標籤系統

### 長期（1-2 個月）

- [ ] 專案模板
- [ ] 專案匯入/匯出
- [ ] 專案統計圖表
- [ ] 專案活動記錄

---

## 📚 相關文件

- **首頁專案顯示**: `docs/UPDATE-2025-10-09-HOMEPAGE-PROJECTS.md`
- **專案管理按鈕**: `docs/UPDATE-2025-10-09-PROJECT-MANAGER-BUTTON.md`
- **PostgreSQL 安裝**: `docs/POSTGRESQL-17-INSTALLATION-COMPLETE.md`
- **資料庫結構**: `server/config/table.config.ts`

---

## 🎉 總結

成功實現完整的專案管理視窗功能，包含專案的 CRUD 操作、多種排序方式、美觀的 UI 設計和完善的錯誤處理。該系統為未來的專案管理功能提供了堅實的基礎。

**核心特點**:
- ✅ 完整的 CRUD 功能
- ✅ 直觀的使用者介面
- ✅ 多種排序方式
- ✅ 安全的刪除機制
- ✅ 良好的錯誤處理
- ✅ 響應式設計
- ✅ RESTful API 設計
- ✅ TypeScript 類型安全

**技術亮點**:
- React Hooks 狀態管理
- Express RESTful API
- PostgreSQL 資料庫
- CSS 動畫效果
- 軟刪除機制
- 完整的類型定義

準備好開始使用專案管理視窗了！🚀
