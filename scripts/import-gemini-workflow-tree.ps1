# 將 GEMINI-SDD-WORKFLOW.md 轉換成樹狀圖並寫入資料庫

Write-Host "🚀 開始匯入 GEMINI-SDD-WORKFLOW 樹狀圖..." -ForegroundColor Cyan
Write-Host ""

$body = @{
    name = "AI輔助規格驅動開發工作流程"
    description = "Gemini API 輔助的 Spec-Driven Development (SDD) Slot Math 完整工作流程"
    project_id = $null
    data = @{
        nodes = @(
            @{ id = "1"; type = "root"; data = @{ label = "🎯 AI輔助規格驅動開發"; description = "Gemini API + SDD 工作流程" }; position = @{ x = 0; y = 0 } }
            @{ id = "2"; type = "section"; data = @{ label = "📋 核心理念"; description = "SDD 的三大核心哲學" }; position = @{ x = -400; y = 150 } }
            @{ id = "2-1"; type = "concept"; data = @{ label = "規格即真理"; description = "math_spec.json 是唯一真理來源" }; position = @{ x = -600; y = 250 } }
            @{ id = "2-2"; type = "concept"; data = @{ label = "AI 輔助設計"; description = "Gemini API 轉換自然語言為規格" }; position = @{ x = -400; y = 250 } }
            @{ id = "2-3"; type = "concept"; data = @{ label = "快速迭代驗證"; description = "規格→模擬→分析→調整閉環" }; position = @{ x = -200; y = 250 } }
            @{ id = "3"; type = "section"; data = @{ label = "📦 專案產出物"; description = "三大交付物件" }; position = @{ x = -100; y = 150 } }
            @{ id = "3-1"; type = "deliverable"; data = @{ label = "math_spec.json"; description = "遊戲數學規格檔案 (JSON)" }; position = @{ x = -300; y = 250 } }
            @{ id = "3-1-1"; type = "detail"; data = @{ label = "gameInfo"; description = "遊戲基本資訊" }; position = @{ x = -500; y = 350 } }
            @{ id = "3-1-2"; type = "detail"; data = @{ label = "symbols"; description = "符號定義" }; position = @{ x = -400; y = 350 } }
            @{ id = "3-1-3"; type = "detail"; data = @{ label = "reels"; description = "滾輪帶配置" }; position = @{ x = -300; y = 350 } }
            @{ id = "3-1-4"; type = "detail"; data = @{ label = "paytable"; description = "賠付表" }; position = @{ x = -200; y = 350 } }
            @{ id = "3-1-5"; type = "detail"; data = @{ label = "features"; description = "特殊玩法" }; position = @{ x = -100; y = 350 } }
            @{ id = "3-2"; type = "deliverable"; data = @{ label = "run_simulation.ts"; description = "模擬腳本 (TypeScript)" }; position = @{ x = -100; y = 250 } }
            @{ id = "3-3"; type = "deliverable"; data = @{ label = "simulation_report.md"; description = "分析報告 (Markdown)" }; position = @{ x = 100; y = 250 } }
            @{ id = "4"; type = "section"; data = @{ label = "🔄 開發流程"; description = "5個Phase完整流程" }; position = @{ x = 200; y = 150 } }
            @{ id = "4-0"; type = "phase"; data = @{ label = "Phase 0: 環境設定"; description = "建立專案目錄" }; position = @{ x = 0; y = 250 } }
            @{ id = "4-1"; type = "phase"; data = @{ label = "Phase 1: 規格定義"; description = "自然語言描述需求" }; position = @{ x = 100; y = 250 } }
            @{ id = "4-2"; type = "phase"; data = @{ label = "Phase 2: 數學模型生成"; description = "Gemini設計滾輪和賠付表" }; position = @{ x = 200; y = 250 } }
            @{ id = "4-3"; type = "phase"; data = @{ label = "Phase 3: 模擬程式碼生成"; description = "Gemini撰寫模擬腳本" }; position = @{ x = 300; y = 250 } }
            @{ id = "4-4"; type = "phase"; data = @{ label = "Phase 4: 執行與分析"; description = "執行模擬並生成報告" }; position = @{ x = 400; y = 250 } }
            @{ id = "4-5"; type = "phase"; data = @{ label = "Phase 5: 迭代與優化"; description = "根據結果調整規格" }; position = @{ x = 500; y = 250 } }
            @{ id = "5"; type = "section"; data = @{ label = "🤖 Gemini API角色"; description = "AI的五大職責" }; position = @{ x = 500; y = 150 } }
            @{ id = "5-1"; type = "role"; data = @{ label = "需求翻譯器"; description = "自然語言→結構化規格" }; position = @{ x = 400; y = 350 } }
            @{ id = "5-2"; type = "role"; data = @{ label = "數學設計師"; description = "滾輪和賠付表計算平衡" }; position = @{ x = 480; y = 350 } }
            @{ id = "5-3"; type = "role"; data = @{ label = "程式碼生成器"; description = "自動生成模擬腳本" }; position = @{ x = 560; y = 350 } }
            @{ id = "5-4"; type = "role"; data = @{ label = "數據分析師"; description = "解讀結果提供優化建議" }; position = @{ x = 640; y = 350 } }
            @{ id = "5-5"; type = "role"; data = @{ label = "創意夥伴"; description = "建議新玩法和機制" }; position = @{ x = 720; y = 350 } }
        )
        edges = @(
            @{ id = "e1-2"; source = "1"; target = "2"; type = "smoothstep" }
            @{ id = "e1-3"; source = "1"; target = "3"; type = "smoothstep" }
            @{ id = "e1-4"; source = "1"; target = "4"; type = "smoothstep" }
            @{ id = "e1-5"; source = "1"; target = "5"; type = "smoothstep" }
            @{ id = "e2-2-1"; source = "2"; target = "2-1"; type = "smoothstep" }
            @{ id = "e2-2-2"; source = "2"; target = "2-2"; type = "smoothstep" }
            @{ id = "e2-2-3"; source = "2"; target = "2-3"; type = "smoothstep" }
            @{ id = "e3-3-1"; source = "3"; target = "3-1"; type = "smoothstep" }
            @{ id = "e3-1-3-1-1"; source = "3-1"; target = "3-1-1"; type = "smoothstep" }
            @{ id = "e3-1-3-1-2"; source = "3-1"; target = "3-1-2"; type = "smoothstep" }
            @{ id = "e3-1-3-1-3"; source = "3-1"; target = "3-1-3"; type = "smoothstep" }
            @{ id = "e3-1-3-1-4"; source = "3-1"; target = "3-1-4"; type = "smoothstep" }
            @{ id = "e3-1-3-1-5"; source = "3-1"; target = "3-1-5"; type = "smoothstep" }
            @{ id = "e3-3-2"; source = "3"; target = "3-2"; type = "smoothstep" }
            @{ id = "e3-3-3"; source = "3"; target = "3-3"; type = "smoothstep" }
            @{ id = "e4-4-0"; source = "4"; target = "4-0"; type = "smoothstep" }
            @{ id = "e4-4-1"; source = "4"; target = "4-1"; type = "smoothstep" }
            @{ id = "e4-4-2"; source = "4"; target = "4-2"; type = "smoothstep" }
            @{ id = "e4-4-3"; source = "4"; target = "4-3"; type = "smoothstep" }
            @{ id = "e4-4-4"; source = "4"; target = "4-4"; type = "smoothstep" }
            @{ id = "e4-4-5"; source = "4"; target = "4-5"; type = "smoothstep" }
            @{ id = "e4-5-4-2"; source = "4-5"; target = "4-2"; type = "smoothstep"; animated = $true; label = "迭代循環" }
            @{ id = "e5-5-1"; source = "5"; target = "5-1"; type = "smoothstep" }
            @{ id = "e5-5-2"; source = "5"; target = "5-2"; type = "smoothstep" }
            @{ id = "e5-5-3"; source = "5"; target = "5-3"; type = "smoothstep" }
            @{ id = "e5-5-4"; source = "5"; target = "5-4"; type = "smoothstep" }
            @{ id = "e5-5-5"; source = "5"; target = "5-5"; type = "smoothstep" }
        )
    }
    tags = @("Gemini", "SDD", "規格驅動開發", "Slot Math", "工作流程", "AI輔助開發")
    is_public = $true
} | ConvertTo-Json -Depth 10

try {
    Write-Host "📤 發送資料到 API..." -ForegroundColor Yellow
    
    $result = Invoke-RestMethod -Uri "http://localhost:5010/api/trees" `
        -Method Post `
        -Body $body `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host ""
    Write-Host "✅ 樹狀圖建立成功!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 樹狀圖資訊:" -ForegroundColor Cyan
    Write-Host "   ID: $($result.id)"
    Write-Host "   UUID: $($result.uuid)"
    Write-Host "   名稱: $($result.name)"
    Write-Host "   描述: $($result.description)"
    Write-Host "   節點數: $($result.node_count)"
    Write-Host "   最大深度: $($result.max_depth)"
    Write-Host "   標籤: $($result.tags -join ', ')"
    Write-Host ""
    Write-Host "🔗 查看樹狀圖: http://localhost:5030/#tree-editor?uuid=$($result.uuid)" -ForegroundColor Magenta
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ 匯入失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
