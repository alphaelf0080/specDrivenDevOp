/**
 * 將 GEMINI-SDD-WORKFLOW.md 轉換為樹狀圖並寫入資料庫
 */

const treeData = {
  name: "Gemini SDD 工作流程",
  description: "AI 輔助的規格驅動 Slot Math 開發流程",
  project_id: null,
  search_key: "gemini-sdd-workflow",
  data: {
    nodes: [
      // 根節點
      {
        id: "root",
        type: "default",
        data: { 
          label: "Gemini SDD 工作流程",
          description: "AI 輔助的規格驅動開發"
        },
        position: { x: 400, y: 50 }
      },
      
      // 第一層：核心理念
      {
        id: "philosophy",
        type: "default",
        data: { 
          label: "核心理念",
          description: "三大核心原則"
        },
        position: { x: 100, y: 150 }
      },
      {
        id: "phil-1",
        type: "default",
        data: { 
          label: "規格即真理",
          description: "math_spec.json 為唯一真理來源"
        },
        position: { x: 50, y: 250 }
      },
      {
        id: "phil-2",
        type: "default",
        data: { 
          label: "AI 輔助設計",
          description: "Gemini API 轉換需求為規格"
        },
        position: { x: 100, y: 320 }
      },
      {
        id: "phil-3",
        type: "default",
        data: { 
          label: "快速迭代驗證",
          description: "規格→模擬→分析→調整閉環"
        },
        position: { x: 150, y: 390 }
      },
      
      // 第一層：產出物
      {
        id: "deliverables",
        type: "default",
        data: { 
          label: "專案產出物",
          description: "三個核心產出"
        },
        position: { x: 400, y: 150 }
      },
      {
        id: "del-1",
        type: "default",
        data: { 
          label: "math_spec.json",
          description: "數學規格檔案"
        },
        position: { x: 350, y: 250 }
      },
      {
        id: "del-2",
        type: "default",
        data: { 
          label: "run_simulation.ts",
          description: "模擬腳本"
        },
        position: { x: 400, y: 320 }
      },
      {
        id: "del-3",
        type: "default",
        data: { 
          label: "simulation_report.md",
          description: "分析報告"
        },
        position: { x: 450, y: 390 }
      },
      
      // 第一層：開發流程
      {
        id: "workflow",
        type: "default",
        data: { 
          label: "開發流程",
          description: "六階段流程"
        },
        position: { x: 700, y: 150 }
      },
      
      // Phase 0
      {
        id: "phase-0",
        type: "default",
        data: { 
          label: "Phase 0: 環境設定",
          description: "建立專案目錄"
        },
        position: { x: 550, y: 250 }
      },
      
      // Phase 1
      {
        id: "phase-1",
        type: "default",
        data: { 
          label: "Phase 1: 規格定義",
          description: "需求→初步規格"
        },
        position: { x: 620, y: 320 }
      },
      {
        id: "p1-step1",
        type: "default",
        data: { 
          label: "使用者提供需求",
          description: "自然語言描述"
        },
        position: { x: 550, y: 400 }
      },
      {
        id: "p1-step2",
        type: "default",
        data: { 
          label: "Gemini 生成規格",
          description: "gameInfo + symbols"
        },
        position: { x: 620, y: 470 }
      },
      
      // Phase 2
      {
        id: "phase-2",
        type: "default",
        data: { 
          label: "Phase 2: 數學模型生成",
          description: "設計滾輪與賠付表"
        },
        position: { x: 690, y: 320 }
      },
      {
        id: "p2-step1",
        type: "default",
        data: { 
          label: "Gemini 設計",
          description: "生成 reels + paytable"
        },
        position: { x: 690, y: 400 }
      },
      {
        id: "p2-step2",
        type: "default",
        data: { 
          label: "使用者審核",
          description: "提出修改意見"
        },
        position: { x: 760, y: 470 }
      },
      {
        id: "p2-step3",
        type: "default",
        data: { 
          label: "Gemini 更新",
          description: "根據回饋調整"
        },
        position: { x: 690, y: 540 }
      },
      
      // Phase 3
      {
        id: "phase-3",
        type: "default",
        data: { 
          label: "Phase 3: 程式碼生成",
          description: "生成模擬腳本"
        },
        position: { x: 760, y: 320 }
      },
      {
        id: "p3-step1",
        type: "default",
        data: { 
          label: "Gemini 讀取規格",
          description: "解析 math_spec.json"
        },
        position: { x: 830, y: 400 }
      },
      {
        id: "p3-step2",
        type: "default",
        data: { 
          label: "生成 TypeScript",
          description: "規格驅動程式碼"
        },
        position: { x: 760, y: 470 }
      },
      
      // Phase 4
      {
        id: "phase-4",
        type: "default",
        data: { 
          label: "Phase 4: 執行與分析",
          description: "模擬並產出報告"
        },
        position: { x: 830, y: 320 }
      },
      {
        id: "p4-step1",
        type: "default",
        data: { 
          label: "執行模擬",
          description: "ts-node 運行腳本"
        },
        position: { x: 900, y: 400 }
      },
      {
        id: "p4-step2",
        type: "default",
        data: { 
          label: "提供結果",
          description: "貼上原始數據"
        },
        position: { x: 830, y: 470 }
      },
      {
        id: "p4-step3",
        type: "default",
        data: { 
          label: "Gemini 分析",
          description: "生成 Markdown 報告"
        },
        position: { x: 900, y: 540 }
      },
      
      // Phase 5
      {
        id: "phase-5",
        type: "default",
        data: { 
          label: "Phase 5: 迭代優化",
          description: "持續改進循環"
        },
        position: { x: 900, y: 320 }
      },
      {
        id: "p5-step1",
        type: "default",
        data: { 
          label: "Gemini 提出建議",
          description: "分析偏差並建議"
        },
        position: { x: 970, y: 400 }
      },
      {
        id: "p5-step2",
        type: "default",
        data: { 
          label: "回到 Phase 2",
          description: "調整規格並重新驗證"
        },
        position: { x: 900, y: 470 }
      },
      
      // Gemini 角色
      {
        id: "gemini-roles",
        type: "default",
        data: { 
          label: "Gemini API 角色",
          description: "五大核心功能"
        },
        position: { x: 400, y: 650 }
      },
      {
        id: "role-1",
        type: "default",
        data: { 
          label: "需求翻譯器",
          description: "自然語言→JSON"
        },
        position: { x: 200, y: 750 }
      },
      {
        id: "role-2",
        type: "default",
        data: { 
          label: "數學設計師",
          description: "滾輪與賠付表設計"
        },
        position: { x: 300, y: 820 }
      },
      {
        id: "role-3",
        type: "default",
        data: { 
          label: "程式碼生成器",
          description: "自動生成驗證腳本"
        },
        position: { x: 400, y: 750 }
      },
      {
        id: "role-4",
        type: "default",
        data: { 
          label: "數據分析師",
          description: "解讀結果與建議"
        },
        position: { x: 500, y: 820 }
      },
      {
        id: "role-5",
        type: "default",
        data: { 
          label: "創意夥伴",
          description: "建議新玩法機制"
        },
        position: { x: 600, y: 750 }
      }
    ],
    edges: [
      // 根節點連接
      { id: "e-root-phil", source: "root", target: "philosophy" },
      { id: "e-root-del", source: "root", target: "deliverables" },
      { id: "e-root-work", source: "root", target: "workflow" },
      { id: "e-root-gemini", source: "root", target: "gemini-roles" },
      
      // 核心理念
      { id: "e-phil-1", source: "philosophy", target: "phil-1" },
      { id: "e-phil-2", source: "philosophy", target: "phil-2" },
      { id: "e-phil-3", source: "philosophy", target: "phil-3" },
      
      // 產出物
      { id: "e-del-1", source: "deliverables", target: "del-1" },
      { id: "e-del-2", source: "deliverables", target: "del-2" },
      { id: "e-del-3", source: "deliverables", target: "del-3" },
      
      // 開發流程
      { id: "e-work-p0", source: "workflow", target: "phase-0" },
      { id: "e-work-p1", source: "workflow", target: "phase-1" },
      { id: "e-work-p2", source: "workflow", target: "phase-2" },
      { id: "e-work-p3", source: "workflow", target: "phase-3" },
      { id: "e-work-p4", source: "workflow", target: "phase-4" },
      { id: "e-work-p5", source: "workflow", target: "phase-5" },
      
      // Phase 流程連接
      { id: "e-p0-p1", source: "phase-0", target: "phase-1", animated: true },
      { id: "e-p1-p2", source: "phase-1", target: "phase-2", animated: true },
      { id: "e-p2-p3", source: "phase-2", target: "phase-3", animated: true },
      { id: "e-p3-p4", source: "phase-3", target: "phase-4", animated: true },
      { id: "e-p4-p5", source: "phase-4", target: "phase-5", animated: true },
      { id: "e-p5-p2", source: "phase-5", target: "phase-2", animated: true, label: "迭代" },
      
      // Phase 1 步驟
      { id: "e-p1-s1", source: "phase-1", target: "p1-step1" },
      { id: "e-p1-s2", source: "p1-step1", target: "p1-step2" },
      
      // Phase 2 步驟
      { id: "e-p2-s1", source: "phase-2", target: "p2-step1" },
      { id: "e-p2-s2", source: "p2-step1", target: "p2-step2" },
      { id: "e-p2-s3", source: "p2-step2", target: "p2-step3" },
      
      // Phase 3 步驟
      { id: "e-p3-s1", source: "phase-3", target: "p3-step1" },
      { id: "e-p3-s2", source: "p3-step1", target: "p3-step2" },
      
      // Phase 4 步驟
      { id: "e-p4-s1", source: "phase-4", target: "p4-step1" },
      { id: "e-p4-s2", source: "p4-step1", target: "p4-step2" },
      { id: "e-p4-s3", source: "p4-step2", target: "p4-step3" },
      
      // Phase 5 步驟
      { id: "e-p5-s1", source: "phase-5", target: "p5-step1" },
      { id: "e-p5-s2", source: "p5-step1", target: "p5-step2" },
      
      // Gemini 角色
      { id: "e-gemini-1", source: "gemini-roles", target: "role-1" },
      { id: "e-gemini-2", source: "gemini-roles", target: "role-2" },
      { id: "e-gemini-3", source: "gemini-roles", target: "role-3" },
      { id: "e-gemini-4", source: "gemini-roles", target: "role-4" },
      { id: "e-gemini-5", source: "gemini-roles", target: "role-5" }
    ]
  },
  tags: ["workflow", "gemini", "sdd", "slot-math"],
  is_public: true,
  metadata: {
    source: "GEMINI-SDD-WORKFLOW.md",
    created_by: "import-script",
    node_count: 41,
    depth: 4
  }
};

// 使用 fetch API 將資料寫入資料庫
async function importTree() {
  try {
    console.log('🚀 開始匯入樹狀圖到資料庫...\n');
    
    const response = await fetch('http://localhost:5010/api/trees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treeData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ 樹狀圖匯入成功!\n');
    console.log('📊 匯入結果:');
    console.log('  - ID:', result.id);
    console.log('  - UUID:', result.uuid);
    console.log('  - 名稱:', result.name);
    console.log('  - 搜尋鍵:', result.search_key);
    console.log('  - 節點數:', result.node_count);
    console.log('  - 深度:', result.depth);
    console.log('  - 標籤:', result.tags.join(', '));
    console.log('\n🌐 在首頁即可查看此樹狀圖!');
    
  } catch (error) {
    console.error('❌ 匯入失敗:', error.message);
    process.exit(1);
  }
}

// 執行匯入
importTree();
