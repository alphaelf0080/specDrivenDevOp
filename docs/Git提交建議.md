# Git 提交建議

## 📝 本次變更摘要

專案主視窗完整實作,包含四色分區布局、五大功能分頁、新視窗開啟機制。

---

## 🎯 建議的 Git 操作

### 1. 查看變更
```bash
git status
git diff
```

### 2. 分階段提交

#### 第一批:核心功能檔案
```bash
# 新增專案主視窗元件
git add client/components/Project/
git add client/pages/

# 提交
git commit -m "feat: 新增專案主視窗元件 (ProjectMainWindow)

- 實作四色分區布局 (藍/紅/綠/黃)
- 五大功能分頁切換 (總覽/規格/設計/開發/測試)
- 專案資料載入與顯示
- 錯誤處理與載入狀態
- 響應式設計支援

檔案:
- client/components/Project/ProjectMainWindow.tsx (131 行)
- client/components/Project/ProjectMainWindow.css (105 行)
- client/pages/ProjectPage.tsx (44 行)"
```

#### 第二批:首頁整合
```bash
# 首頁整合變更
git add client/components/Navigation/HomePage.tsx
git add client/components/Navigation/HomePage.css
git add client/App.tsx

# 提交
git commit -m "feat: 首頁專案卡片整合新視窗開啟

- 專案卡片縮減為單行高度 (48px)
- 專案統計區移至列表上方
- 點擊專案卡片使用 window.open 開啟新視窗
- App.tsx 新增 project-page 路由支援

修改檔案:
- client/components/Navigation/HomePage.tsx
- client/components/Navigation/HomePage.css
- client/App.tsx"
```

#### 第三批:文檔更新
```bash
# 文檔更新
git add CHANGELOG.md
git add README.md
git add docs/專案主視窗*.md
git add docs/更新紀錄*.md

# 提交
git commit -m "docs: 更新專案主視窗實作文檔

- CHANGELOG.md 新增功能記錄
- README.md 新增專案主視窗說明
- 新增詳細實作文檔和布局設計文檔

新增檔案:
- docs/專案主視窗布局實作完成.md
- docs/更新紀錄-專案主視窗實作.md"
```

#### 第四批:其他變更
```bash
# 其他配置和構建產物
git add server/
git add dist/client/
git add .env

# 提交
git commit -m "chore: 更新伺服器配置和構建產物

- 資料庫配置更新
- 專案 API 路由增強
- 前端構建產物更新"
```

---

## 🔍 提交前檢查清單

- [ ] 所有檔案已儲存
- [ ] 無編譯錯誤
- [ ] 所有測試通過
- [ ] 程式碼符合 ESLint 規範
- [ ] 提交訊息清晰明確
- [ ] 相關文檔已更新

---

## 📤 推送到遠端

```bash
# 推送所有提交
git push origin main

# 如果需要強制推送 (謹慎使用)
git push -f origin main
```

---

## 🎨 Conventional Commits 格式

本次使用的提交類型:

- **feat**: 新增功能
- **docs**: 文檔更新
- **chore**: 雜項更新 (配置、構建等)

其他常用類型:
- **fix**: 修復 bug
- **refactor**: 重構程式碼
- **style**: 程式碼格式化
- **test**: 測試相關
- **perf**: 效能優化

---

## 📊 變更統計

```
新增:
+ client/components/Project/ProjectMainWindow.tsx (131 行)
+ client/components/Project/ProjectMainWindow.css (105 行)
+ client/pages/ProjectPage.tsx (44 行)
+ docs/專案主視窗布局實作完成.md
+ docs/更新紀錄-專案主視窗實作.md

修改:
M client/components/Navigation/HomePage.tsx
M client/components/Navigation/HomePage.css
M client/App.tsx
M CHANGELOG.md
M README.md
M server/routes/projects.ts
M server/config/database.config.ts

構建產物:
M dist/client/index.html
+ dist/client/assets/main-B8TyCq-G.js
+ dist/client/assets/main-BeO_-tpy.css
```

---

## 🚀 快速提交指令 (All-in-One)

如果想一次提交所有變更:

```bash
git add .
git commit -m "feat: 實作專案主視窗完整功能

新增功能:
- 四色分區布局 (標題列/導航欄/預覽欄/編輯區)
- 五大功能分頁 (總覽/規格/設計/開發/測試)
- 新視窗開啟機制 (1400×900px)
- 響應式設計支援
- 專案資料載入與錯誤處理

整合優化:
- 首頁專案卡片改為單行高度
- 專案統計區重新排列
- 新增 window.open 新視窗開啟

文檔更新:
- CHANGELOG.md 新增功能記錄
- README.md 新增專案主視窗說明
- 新增詳細實作和布局設計文檔

新增檔案: 3 個元件檔案 + 2 個文檔
修改檔案: 6 個專案檔案 + 2 個文檔
程式碼行數: 300+ 行 (TypeScript + CSS)"

git push origin main
```

---

## ⚠️ 注意事項

1. **dist/ 目錄**: 構建產物通常不需要提交到版本控制,可以考慮加入 .gitignore
2. **.env 檔案**: 環境變數檔案不應提交敏感資料
3. **node_modules/**: 應該已在 .gitignore 中,只提交 package-lock.json

---

## 📋 .gitignore 建議

確保以下內容在 `.gitignore` 中:

```gitignore
# 依賴套件
node_modules/
.npm/
.yarn/

# 構建產物
dist/
build/
*.js.map

# 環境變數
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系統檔案
.DS_Store
Thumbs.db

# 日誌
*.log
npm-debug.log*
```

---

**建議**: 採用分階段提交方式,讓 Git 歷史更清晰易讀! 🎯
