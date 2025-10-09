# 樹狀圖資料遷移腳本
# 執行方式: .\migrate-trees.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  樹狀圖資料遷移工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 檢查 Node.js
Write-Host "🔍 檢查 Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 找不到 Node.js，請先安裝 Node.js" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "   ✅ Node.js $nodeVersion" -ForegroundColor Green

# 2. 檢查伺服器
Write-Host "🔍 檢查伺服器狀態..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5010/api/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "ok") {
        Write-Host "   ✅ 伺服器運行中" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  伺服器狀態異常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ 無法連接伺服器，請先啟動伺服器 (npm run server)" -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "是否繼續? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

# 3. 檢查資料庫連接
Write-Host "🔍 檢查資料庫連接..." -ForegroundColor Yellow
try {
    $dbCheck = Invoke-RestMethod -Uri "http://localhost:5010/api/health" -Method Get -TimeoutSec 5
    Write-Host "   ✅ 資料庫連接正常" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  無法確認資料庫狀態" -ForegroundColor Yellow
}

# 4. 顯示遷移資訊
Write-Host ""
Write-Host "📋 遷移資訊:" -ForegroundColor Cyan
Write-Host "   - 將 projects.tree_data 遷移到 trees 表"
Write-Host "   - 自動計算節點數和樹深度"
Write-Host "   - 更新 projects.main_tree_id 關聯"
Write-Host "   - 支援軟刪除和版本控制"
Write-Host ""

# 5. 確認執行
Write-Host "⚠️  準備執行遷移..." -ForegroundColor Yellow
$confirm = Read-Host "確定要執行嗎? (y/N)"
if ($confirm -ne "y") {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  開始執行遷移" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. 執行遷移
try {
    # 使用 tsx 直接執行 TypeScript
    npx tsx server/database/migrate-trees.ts
    
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ 遷移完成" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 下一步:" -ForegroundColor Cyan
        Write-Host "   1. 檢查資料庫確認遷移結果"
        Write-Host "   2. 測試前端樹狀圖功能"
        Write-Host "   3. 查看文檔: docs/tree-migration-complete.md"
        Write-Host ""
    } else {
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ❌ 遷移失敗" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "請檢查錯誤訊息並重試" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 執行過程發生錯誤" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
