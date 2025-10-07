# Layout JSON 說明

這個資料夾包含擺位/對位 JSON，對應 PSD 1080x1920 畫布：
- manifest.json：完整分類清單（backgrounds/ui/bfg/reel/symbols/marquee/logo/jp/transitions）與 flat 目錄（全節點）
- ui_layout.json：底部操作 UI（Spin/Auto/Turbo/Bet +/- 等）
- bfg_layout.json：BFG（Bonus Feature Guide/Free Games）按鈕與文字、數字預覽
- reel_layout.json：5x4 轉輪格子定位（sym 定位）

共同格式
- meta.canvas：PSD 原始座標空間（1080x1920）
- bboxPx：以 PSD 像素為單位的矩形（x,y,w,h）
- bboxPct：以畫布百分比表達的矩形（x,y,w,h），便於等比縮放與信箱（letterbox）

前端套用建議（等比縮放 + 信箱）
1. 先計算 scale = min(viewW/1080, viewH/1920)
2. 可視區域左上偏移：
   - 如果水平留邊：offsetX = (viewW - 1080*scale)/2, offsetY = 0
   - 如果垂直留邊：offsetX = 0, offsetY = (viewH - 1920*scale)/2
3. worldX = offsetX + bboxPx.x * scale
   worldY = offsetY + bboxPx.y * scale
   worldW = bboxPx.w * scale
   worldH = bboxPx.h * scale

或使用百分比：
- worldX = offsetX + bboxPct.x * 1080 * scale
- worldY = offsetY + bboxPct.y * 1920 * scale
- worldW = bboxPct.w * 1080 * scale
- worldH = bboxPct.h * 1920 * scale

Reel cell center（常用於擺放 symbol 中心點）：
- centerX = worldX + worldW/2
- centerY = worldY + worldH/2

注意事項
- 若未提供 bboxPct，可用 bboxPx 反推：x/1080, y/1920, w/1080, h/1920
- 某些按鈕 hover/down 與 up 同位置，僅資產圖不同；可直接覆蓋渲染
- bfg_layout 的文字/數字 glyphs 提供矩形包絡盒，實際排版可用中心點與等比縮放修正
