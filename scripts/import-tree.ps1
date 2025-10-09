$ErrorActionPreference = "Stop"

Write-Host "Loading tree data from JSON file..." -ForegroundColor Cyan
$treeDataJson = Get-Content -Path "scripts\gemini-workflow-tree.json" -Raw -Encoding UTF8

Write-Host "Sending request to API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5010/api/trees" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $treeDataJson `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json

    Write-Host "`nTree imported successfully!" -ForegroundColor Green
    Write-Host "`nImport Results:" -ForegroundColor Yellow
    Write-Host "  - ID: $($result.id)"
    Write-Host "  - UUID: $($result.uuid)"
    Write-Host "  - Name: $($result.name)"
    Write-Host "  - Search Key: $($result.search_key)"
    Write-Host "  - Node Count: $($result.node_count)"
    Write-Host "  - Depth: $($result.depth)"
    Write-Host "  - Tags: $($result.tags -join ', ')"
    Write-Host "`nYou can now view this tree on the homepage!" -ForegroundColor Cyan
}
catch {
    Write-Host "`nImport failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}
