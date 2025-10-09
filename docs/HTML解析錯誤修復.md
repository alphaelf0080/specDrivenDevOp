# HTML 解析錯誤修復

## 問題
Vite 在解析 `templates/遊戲側錄工具/架構說明網頁.html` 時出現錯誤:
```
Unable to parse HTML; parse5 error code invalid-first-character-of-tag-name
```

## 原因
HTML 文件中的 Python 代碼包含 `<=` 運算符,HTML 解析器將 `<` 誤認為標籤開始。

## 修復
將 line 1239 的 Python 代碼中的 `<=` 改為 HTML 實體 `&lt;=`:

```python
# 修復前
if not isinstance(data['spin_count'], int) or data['spin_count'] <= 0:

# 修復後  
if not isinstance(data['spin_count'], int) or data['spin_count'] &lt;= 0:
```

## 驗證
修復已應用,重啟開發伺服器後應該可以正常訪問該 HTML 文件。

如果問題仍然存在,可能是 Vite 的緩存問題,請嘗試:
1. 刪除 `node_modules/.vite` 目錄
2. 重新啟動開發伺服器
