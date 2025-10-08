import { MindMapData } from '../types/mindmap';

// 定義節點資料
const nodes = [
  { id: 'art-root', label: 'SDD 美術開發方案與執行計畫', type: 'root' },
  { id: 'principles', label: '目標與原則', type: 'branch', style: { backgroundColor: '#E0F2FE', borderColor: '#0284C7', textColor: '#0C4A6E' } },
  { id: 'principles-ssot', label: 'SSOT：規格為中心', type: 'leaf' },
  { id: 'principles-deterministic', label: '確定性與可重現', type: 'leaf' },
  { id: 'principles-automation', label: '自動化優先', type: 'leaf' },
  { id: 'principles-shift-left', label: '左移質量（Week 0）', type: 'leaf' },
  { id: 'principles-audit', label: '可審計（版本/報告）', type: 'leaf' },
  { id: 'principles-kpi', label: 'KPI：命名/尺寸/壓縮/首屏/FPS', type: 'leaf' },

  { id: 'contract', label: '輸入與輸出（Contract）', type: 'branch', style: { backgroundColor: '#F1F5F9', borderColor: '#475569', textColor: '#0F172A' } },
  { id: 'inputs', label: 'Inputs：規格/PSD 結構/資產規範', type: 'leaf' },
  { id: 'outputs', label: 'Outputs：manifest/圖像/音訊/報告', type: 'leaf' },
  { id: 'manifest-fields', label: 'manifest 欄位建議', type: 'leaf' },

  { id: 'naming', label: '命名與尺寸/格式', type: 'branch', style: { backgroundColor: '#FEF3C7', borderColor: '#D97706', textColor: '#7C2D12' } },
  { id: 'naming-categories', label: '類別：bg/sym/btn/tx/icon/num/line', type: 'leaf' },
  { id: 'naming-symbol', label: '符號：240×240（10% 留白）', type: 'leaf' },
  { id: 'naming-bg', label: '背景：1080×1920 JPG Q85-90', type: 'leaf' },
  { id: 'naming-button', label: '按鈕四態：≥ 88×88', type: 'leaf' },
  { id: 'naming-compress', label: '壓縮：pngquant/mozjpeg/WebP', type: 'leaf' },
  { id: 'naming-audio', label: '音訊：MP3 192kbps / OGG 128kbps', type: 'leaf' },

  { id: 'psd', label: 'PSD 結構與切圖', type: 'branch', style: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED', textColor: '#4C1D95' } },
  { id: 'psd-groups', label: '分組：MG/FG/Popup 與資產類別', type: 'leaf' },
  { id: 'psd-states', label: '按鈕四態成組：up/hover/down/disable', type: 'leaf' },
  { id: 'psd-i18n', label: '多語文字圖：tx_*_{lang}', type: 'leaf' },
  { id: 'psd-export', label: '切圖原則：透明=PNG、大圖=JPG/WebP', type: 'leaf' },
  { id: 'psd-structure-json', label: 'psd_structure.json 自動化', type: 'leaf' },

  { id: 'workflow', label: '工作流程（端到端）', type: 'branch', style: { backgroundColor: '#DCFCE7', borderColor: '#16A34A', textColor: '#14532D' } },
  { id: 'wf-spec-list', label: '1) 規格驅動資產清單', type: 'leaf' },
  { id: 'wf-design-export', label: '2) 視覺設計與導出', type: 'leaf' },
  { id: 'wf-check-fix', label: '3) 檢查與修正（自動化）', type: 'leaf' },
  { id: 'wf-integration', label: '4) 整合與載入策略', type: 'leaf' },
  { id: 'wf-versioning', label: '5) 版本與審計（diff/Changelog）', type: 'leaf' },

  { id: 'plan', label: '執行計畫（8 週）', type: 'branch', style: { backgroundColor: '#FFE4E6', borderColor: '#E11D48', textColor: '#881337' } },
  { id: 'wk0', label: 'Week 0：前置/骨架/基線', type: 'leaf' },
  { id: 'wk1-2', label: 'Week 1–2：規格 v1/風格定稿', type: 'leaf' },
  { id: 'wk3-4', label: 'Week 3–4：原型可視化/回放', type: 'leaf' },
  { id: 'wk5', label: 'Week 5：內容整備/零高風險', type: 'leaf' },
  { id: 'wk6', label: 'Week 6：數值平衡/凍結視覺', type: 'leaf' },
  { id: 'wk7', label: 'Week 7：整合測試/性能回歸', type: 'leaf' },
  { id: 'wk8', label: 'Week 8：合規/上線/回放', type: 'leaf' },

  { id: 'raci', label: 'RACI 與角色', type: 'branch', style: { backgroundColor: '#F5F3FF', borderColor: '#6D28D9', textColor: '#4431A3' } },
  { id: 'raci-art', label: 'Art（R）設計/導出/修正', type: 'leaf' },
  { id: 'raci-asset', label: 'Asset Agent（A/R）清單/校驗/報告', type: 'leaf' },
  { id: 'raci-fe', label: 'FE（C）載入與性能', type: 'leaf' },
  { id: 'raci-qa', label: 'QA（C/A）檢查/E2E/回放', type: 'leaf' },
  { id: 'raci-tl', label: 'Tech Lead（A）變更守門', type: 'leaf' },
  { id: 'raci-cadence', label: '節奏：日站會/週審查', type: 'leaf' },

  { id: 'change', label: '變更管理（RFC）', type: 'branch', style: { backgroundColor: '#FFF7ED', borderColor: '#EA580C', textColor: '#9A3412' } },
  { id: 'change-stages', label: '三階段：提案→實作→審查', type: 'leaf' },
  { id: 'change-major', label: '重大變更：新符號/尺寸/RTP>5%', type: 'leaf' },
  { id: 'change-attachments', label: '附件：差異/檢查/影響/回滾', type: 'leaf' },

  { id: 'quality', label: '品質門（Quality Gates）', type: 'branch', style: { backgroundColor: '#ECFCCB', borderColor: '#65A30D', textColor: '#365314' } },
  { id: 'quality-naming', label: '命名/結構 規則通過', type: 'leaf' },
  { id: 'quality-size', label: '尺寸/格式 與標準一致', type: 'leaf' },
  { id: 'quality-compress', label: '壓縮/體積 達標', type: 'leaf' },
  { id: 'quality-script', label: '腳本檢查：check-assets 綠燈', type: 'leaf' },
  { id: 'quality-dod', label: 'DoD 對應條款達成', type: 'leaf' },

  { id: 'risks', label: '風險與緩解', type: 'branch', style: { backgroundColor: '#FAE8FF', borderColor: '#C026D3', textColor: '#701A75' } },
  { id: 'risk-missing', label: '缺漏/延誤：缺漏清單+追蹤', type: 'leaf' },
  { id: 'risk-size', label: '體積過大：WebP/合圖/lazy', type: 'leaf' },
  { id: 'risk-i18n', label: '多語爆量：字渲染優先', type: 'leaf' },
  { id: 'risk-changes', label: '變更頻繁：RFC+凍結窗口', type: 'leaf' },

  { id: 'checklists', label: '落地清單（Checklists）', type: 'branch', style: { backgroundColor: '#E2E8F0', borderColor: '#334155', textColor: '#1E293B' } },
  { id: 'list-pre', label: '出圖前：PSD/尺寸/四態/多語', type: 'leaf' },
  { id: 'list-export', label: '導出後：命名/透明/壓縮', type: 'leaf' },
  { id: 'list-integrate', label: '整合前：manifest/報告/載入', type: 'leaf' },

  { id: 'verify', label: '運行與驗證指引', type: 'branch', style: { backgroundColor: '#E0F7FA', borderColor: '#0891B2', textColor: '#155E75' } },
  { id: 'verify-check-assets', label: 'check-assets：產出報告', type: 'leaf' },
  { id: 'verify-smoke', label: 'FE 煙霧測試：spin demo', type: 'leaf' },

  { id: 'next', label: '後續擴充', type: 'branch', style: { backgroundColor: '#F0FDFA', borderColor: '#0D9488', textColor: '#115E59' } },
  { id: 'next-manifest', label: '自動生成 manifest', type: 'leaf' },
  { id: 'next-webp', label: 'WebP 轉換與門檻', type: 'leaf' },
  { id: 'next-jsx', label: 'Photoshop JSX 切圖', type: 'leaf' },
  { id: 'next-dashboard', label: '多語覆蓋率儀表板', type: 'leaf' }
] as const;

// 以簡潔方式定義邊並自動生成 id，避免手動維護大量字串
const rawEdges = [
  { source: 'art-root', target: 'principles' },
  { source: 'art-root', target: 'contract' },
  { source: 'art-root', target: 'naming' },
  { source: 'art-root', target: 'psd' },
  { source: 'art-root', target: 'workflow' },
  { source: 'art-root', target: 'plan' },
  { source: 'art-root', target: 'raci' },
  { source: 'art-root', target: 'change' },
  { source: 'art-root', target: 'quality' },
  { source: 'art-root', target: 'risks' },
  { source: 'art-root', target: 'checklists' },
  { source: 'art-root', target: 'verify' },
  { source: 'art-root', target: 'next' },

  { source: 'principles', target: 'principles-ssot' },
  { source: 'principles', target: 'principles-deterministic' },
  { source: 'principles', target: 'principles-automation' },
  { source: 'principles', target: 'principles-shift-left' },
  { source: 'principles', target: 'principles-audit' },
  { source: 'principles', target: 'principles-kpi' },

  { source: 'contract', target: 'inputs' },
  { source: 'contract', target: 'outputs' },
  { source: 'contract', target: 'manifest-fields' },

  { source: 'naming', target: 'naming-categories' },
  { source: 'naming', target: 'naming-symbol' },
  { source: 'naming', target: 'naming-bg' },
  { source: 'naming', target: 'naming-button' },
  { source: 'naming', target: 'naming-compress' },
  { source: 'naming', target: 'naming-audio' },

  { source: 'psd', target: 'psd-groups' },
  { source: 'psd', target: 'psd-states' },
  { source: 'psd', target: 'psd-i18n' },
  { source: 'psd', target: 'psd-export' },
  { source: 'psd', target: 'psd-structure-json' },

  { source: 'workflow', target: 'wf-spec-list' },
  { source: 'workflow', target: 'wf-design-export' },
  { source: 'workflow', target: 'wf-check-fix' },
  { source: 'workflow', target: 'wf-integration' },
  { source: 'workflow', target: 'wf-versioning' },

  { source: 'plan', target: 'wk0' },
  { source: 'plan', target: 'wk1-2' },
  { source: 'plan', target: 'wk3-4' },
  { source: 'plan', target: 'wk5' },
  { source: 'plan', target: 'wk6' },
  { source: 'plan', target: 'wk7' },
  { source: 'plan', target: 'wk8' },

  { source: 'raci', target: 'raci-art' },
  { source: 'raci', target: 'raci-asset' },
  { source: 'raci', target: 'raci-fe' },
  { source: 'raci', target: 'raci-qa' },
  { source: 'raci', target: 'raci-tl' },
  { source: 'raci', target: 'raci-cadence' },

  { source: 'change', target: 'change-stages' },
  { source: 'change', target: 'change-major' },
  { source: 'change', target: 'change-attachments' },

  { source: 'quality', target: 'quality-naming' },
  { source: 'quality', target: 'quality-size' },
  { source: 'quality', target: 'quality-compress' },
  { source: 'quality', target: 'quality-script' },
  { source: 'quality', target: 'quality-dod' },

  { source: 'risks', target: 'risk-missing' },
  { source: 'risks', target: 'risk-size' },
  { source: 'risks', target: 'risk-i18n' },
  { source: 'risks', target: 'risk-changes' },

  { source: 'checklists', target: 'list-pre' },
  { source: 'checklists', target: 'list-export' },
  { source: 'checklists', target: 'list-integrate' },

  { source: 'verify', target: 'verify-check-assets' },
  { source: 'verify', target: 'verify-smoke' },

  { source: 'next', target: 'next-manifest' },
  { source: 'next', target: 'next-webp' },
  { source: 'next', target: 'next-jsx' },
  { source: 'next', target: 'next-dashboard' }
] as const;

const edges: MindMapData['edges'] = rawEdges.map((e, i) => ({
  id: `e-${i + 1}`,
  source: e.source,
  target: e.target,
}));

export const artMindMapData: MindMapData = {
  title: 'SDD 美術開發方案與執行計畫',
  description: '依據 docs/SDD-美術開發方案與執行計畫.md 產生的可視化心智圖資料',
  nodes: nodes as unknown as MindMapData['nodes'],
  edges,
};
