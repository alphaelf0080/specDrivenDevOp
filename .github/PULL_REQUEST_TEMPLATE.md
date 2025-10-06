# Pull Request

## 變更摘要
<!-- 簡述此 PR 的目的與變更內容 -->

## 變更類型
- [ ] 規格變更（spec.json）
- [ ] 引擎邏輯（engine/*）
- [ ] 前端渲染（FE）
- [ ] 後端 API（BE）
- [ ] 美術資產（assets/）
- [ ] 測試（tests/）
- [ ] 文檔（docs/）
- [ ] CI/CD 配置

## 影響面分析
<!-- 此變更影響哪些模組？例如：symbols、paytable、reels、UI 等 -->

**影響模組**：
- [ ] Symbols
- [ ] Reels/Strips
- [ ] Paytable
- [ ] Paylines
- [ ] Assets
- [ ] API Contract
- [ ] 其他：___________

**預估影響**：
- RTP 變化：____ → ____ （±_____%）
- 波動度變化：____ → ____
- 新增/移除資產數量：____

## 驗證步驟

### 1. Schema 驗證
```bash
npm run cli -- validate -s src/specs/games/<spec-file>.json
```
**結果**：✅ 通過 / ❌ 失敗

### 2. 模擬測試
```bash
npm run cli -- simulate -s src/specs/games/<spec-file>.json --spins 10000 --seed pr-<PR-NUMBER>
```

**模擬結果**：
- RTP: ______
- Hit Rate: ______
- Volatility: ______
- Max Win: ______

### 3. 單元測試
```bash
npm test
```
**覆蓋率**：______%
**結果**：✅ 全綠 / ❌ 有失敗

### 4. 其他驗證
<!-- 視覺回歸、整合測試、效能測試等 -->

## 風險評估

**風險等級**：🟢 低 / 🟡 中 / 🔴 高

**潛在風險**：
<!-- 例如：可能導致 RTP 偏離目標、破壞確定性、影響現有測試等 -->

**緩解措施**：
<!-- 如何降低風險？例如：增加模擬樣本、補充測試案例、設置監控等 -->

## Checklist

- [ ] 代碼通過 Lint 檢查（`npm run lint`）
- [ ] 所有測試通過（`npm test`）
- [ ] 已更新相關文檔（如有需要）
- [ ] 已補充測試案例（如為新功能）
- [ ] CI Pipeline 全綠
- [ ] 已標記 Reviewers（規格變更需 Math Lead 審核）
- [ ] 變更紀錄已更新（`docs/CHANGELOG.md`，如為重大變更）

## 相關 Issue/Ticket
<!-- 關聯的 Issue 或 Jira Ticket -->
Closes #<issue-number>

## 截圖或錄影
<!-- 如為 UI 變更，請附上截圖或錄影 -->

## 額外說明
<!-- 其他需要 Reviewer 注意的事項 -->
