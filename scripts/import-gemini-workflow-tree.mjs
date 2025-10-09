/**
 * 將 GEMINI-SDD-WORKFLOW.md 文件轉換成樹狀圖並寫入資料庫
 */

import http from 'http';

// 定義樹狀圖結構
const treeData = {
  name: 'AI輔助規格驅動開發工作流程',
  description: 'Gemini API 輔助的 Spec-Driven Development (SDD) Slot Math 完整工作流程',
  project_id: null, // 獨立樹狀圖,不屬於任何專案
  data: {
    nodes: [
      // 1. 根節點
      {
        id: '1',
        type: 'root',
        data: { 
          label: '🎯 AI輔助規格驅動開發',
          description: 'Gemini API + SDD 工作流程'
        },
        position: { x: 0, y: 0 }
      },

      // 2. 第一層:三大核心理念
      {
        id: '2',
        type: 'section',
        data: { 
          label: '📋 核心理念',
          description: 'SDD 的三大核心哲學'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '2-1',
        type: 'concept',
        data: { 
          label: '規格即真理',
          description: 'math_spec.json 是唯一真理來源 (Single Source of Truth)'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '2-2',
        type: 'concept',
        data: { 
          label: 'AI 輔助設計',
          description: 'Gemini API 將自然語言轉換為數學規格'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '2-3',
        type: 'concept',
        data: { 
          label: '快速迭代驗證',
          description: '規格 → 模擬 → 分析 → 調整的閉環'
        },
        position: { x: 0, y: 0 }
      },

      // 3. 第二層:專案產出物
      {
        id: '3',
        type: 'section',
        data: { 
          label: '📦 專案產出物',
          description: '三大交付物件'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1',
        type: 'deliverable',
        data: { 
          label: 'math_spec.json',
          description: '遊戲數學規格檔案 (JSON)',
          details: 'gameInfo, symbols, reels, paytable, features'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1-1',
        type: 'detail',
        data: { 
          label: 'gameInfo',
          description: '遊戲基本資訊:名稱、軸數、行數、線數、目標RTP、波動率'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1-2',
        type: 'detail',
        data: { 
          label: 'symbols',
          description: '符號定義:圖標名稱、Wild/Scatter 屬性'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1-3',
        type: 'detail',
        data: { 
          label: 'reels',
          description: '滾輪帶配置:每軸的符號排列'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1-4',
        type: 'detail',
        data: { 
          label: 'paytable',
          description: '賠付表:每個符號的連線賠付倍率'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-1-5',
        type: 'detail',
        data: { 
          label: 'features',
          description: '特殊玩法:Free Spins、Bonus Game 等'
        },
        position: { x: 0, y: 0 }
      },

      {
        id: '3-2',
        type: 'deliverable',
        data: { 
          label: 'run_simulation.ts',
          description: '數學模擬腳本 (TypeScript)',
          details: '動態讀取規格並執行蒙地卡羅模擬'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '3-3',
        type: 'deliverable',
        data: { 
          label: 'simulation_report.md',
          description: '模擬分析報告 (Markdown)',
          details: '實際RTP、波動率、命中率、優化建議'
        },
        position: { x: 0, y: 0 }
      },

      // 4. 第三層:開發流程 (5個Phase)
      {
        id: '4',
        type: 'section',
        data: { 
          label: '🔄 開發流程',
          description: '從環境設定到迭代優化的完整流程'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 0: 環境設定
      {
        id: '4-0',
        type: 'phase',
        data: { 
          label: 'Phase 0: 環境設定',
          description: '建立專案目錄結構'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-0-1',
        type: 'action',
        data: { 
          label: '建立專案目錄',
          description: '例如: specs/slot_game_1/'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 1: 規格定義
      {
        id: '4-1',
        type: 'phase',
        data: { 
          label: 'Phase 1: 規格定義',
          description: '用自然語言描述需求'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-1-1',
        type: 'action',
        data: { 
          label: '使用者提供需求',
          description: '自然語言描述 gameInfo (例如:高波動率遊戲)'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-1-2',
        type: 'action',
        data: { 
          label: 'Gemini 生成初步規格',
          description: '建立 math_spec.json 的初始版本 (gameInfo + symbols)'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 2: 數學模型生成
      {
        id: '4-2',
        type: 'phase',
        data: { 
          label: 'Phase 2: 數學模型生成',
          description: 'Gemini 設計滾輪和賠付表'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-2-1',
        type: 'action',
        data: { 
          label: 'Gemini 設計滾輪與賠付表',
          description: '基於 gameInfo 計算並生成 reels 和 paytable'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-2-2',
        type: 'action',
        data: { 
          label: '使用者審核與調整',
          description: '審核設計並提出修改意見'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-2-3',
        type: 'action',
        data: { 
          label: 'Gemini 更新規格',
          description: '根據回饋更新 math_spec.json'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 3: 模擬程式碼生成
      {
        id: '4-3',
        type: 'phase',
        data: { 
          label: 'Phase 3: 模擬程式碼生成',
          description: 'Gemini 撰寫模擬腳本'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-3-1',
        type: 'action',
        data: { 
          label: 'Gemini 讀取規格',
          description: '讀取 math_spec.json 的最終版本'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-3-2',
        type: 'action',
        data: { 
          label: 'Gemini 生成程式碼',
          description: '撰寫 run_simulation.ts (完全由規格驅動)'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 4: 執行與分析
      {
        id: '4-4',
        type: 'phase',
        data: { 
          label: 'Phase 4: 執行與分析',
          description: '執行模擬並生成報告'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-4-1',
        type: 'action',
        data: { 
          label: '使用者執行模擬',
          description: 'npx ts-node run_simulation.ts --spins=100000000'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-4-2',
        type: 'action',
        data: { 
          label: '使用者提供結果',
          description: '將模擬原始數據貼給 Gemini'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-4-3',
        type: 'action',
        data: { 
          label: 'Gemini 生成報告',
          description: '分析數據,產出 simulation_report.md,比較與目標的差異'
        },
        position: { x: 0, y: 0 }
      },

      // Phase 5: 迭代與優化
      {
        id: '4-5',
        type: 'phase',
        data: { 
          label: 'Phase 5: 迭代與優化',
          description: '根據結果調整規格'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-5-1',
        type: 'action',
        data: { 
          label: 'Gemini 提出建議',
          description: '如果偏差,提出具體調整建議'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '4-5-2',
        type: 'action',
        data: { 
          label: '循環迭代',
          description: '回到 Phase 2 調整規格,重新執行 Phase 3-4,直到達標'
        },
        position: { x: 0, y: 0 }
      },

      // 5. 第四層:Gemini API 的五大角色
      {
        id: '5',
        type: 'section',
        data: { 
          label: '🤖 Gemini API 角色',
          description: 'AI 在流程中的五大職責'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '5-1',
        type: 'role',
        data: { 
          label: '需求翻譯器',
          description: '將自然語言需求轉化為結構化的 math_spec.json'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '5-2',
        type: 'role',
        data: { 
          label: '數學設計師',
          description: '負責滾輪和賠付表的計算與平衡'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '5-3',
        type: 'role',
        data: { 
          label: '程式碼生成器',
          description: '根據規格自動生成驗證用的模擬腳本'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '5-4',
        type: 'role',
        data: { 
          label: '數據分析師',
          description: '解讀模擬結果,提供清晰的報告和優化建議'
        },
        position: { x: 0, y: 0 }
      },
      {
        id: '5-5',
        type: 'role',
        data: { 
          label: '創意夥伴',
          description: '根據需求建議新的特殊玩法或數學機制'
        },
        position: { x: 0, y: 0 }
      }
    ],
    edges: [
      // 根節點連接到四個主要區塊
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
      { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
      { id: 'e1-5', source: '1', target: '5', type: 'smoothstep' },

      // 核心理念分支
      { id: 'e2-2-1', source: '2', target: '2-1', type: 'smoothstep' },
      { id: 'e2-2-2', source: '2', target: '2-2', type: 'smoothstep' },
      { id: 'e2-2-3', source: '2', target: '2-3', type: 'smoothstep' },

      // 專案產出物分支
      { id: 'e3-3-1', source: '3', target: '3-1', type: 'smoothstep' },
      { id: 'e3-3-2', source: '3', target: '3-2', type: 'smoothstep' },
      { id: 'e3-3-3', source: '3', target: '3-3', type: 'smoothstep' },

      // math_spec.json 的子項
      { id: 'e3-1-3-1-1', source: '3-1', target: '3-1-1', type: 'smoothstep' },
      { id: 'e3-1-3-1-2', source: '3-1', target: '3-1-2', type: 'smoothstep' },
      { id: 'e3-1-3-1-3', source: '3-1', target: '3-1-3', type: 'smoothstep' },
      { id: 'e3-1-3-1-4', source: '3-1', target: '3-1-4', type: 'smoothstep' },
      { id: 'e3-1-3-1-5', source: '3-1', target: '3-1-5', type: 'smoothstep' },

      // 開發流程的五個階段
      { id: 'e4-4-0', source: '4', target: '4-0', type: 'smoothstep' },
      { id: 'e4-4-1', source: '4', target: '4-1', type: 'smoothstep' },
      { id: 'e4-4-2', source: '4', target: '4-2', type: 'smoothstep' },
      { id: 'e4-4-3', source: '4', target: '4-3', type: 'smoothstep' },
      { id: 'e4-4-4', source: '4', target: '4-4', type: 'smoothstep' },
      { id: 'e4-4-5', source: '4', target: '4-5', type: 'smoothstep' },

      // Phase 0 動作
      { id: 'e4-0-4-0-1', source: '4-0', target: '4-0-1', type: 'smoothstep' },

      // Phase 1 動作
      { id: 'e4-1-4-1-1', source: '4-1', target: '4-1-1', type: 'smoothstep' },
      { id: 'e4-1-4-1-2', source: '4-1', target: '4-1-2', type: 'smoothstep' },

      // Phase 2 動作
      { id: 'e4-2-4-2-1', source: '4-2', target: '4-2-1', type: 'smoothstep' },
      { id: 'e4-2-4-2-2', source: '4-2', target: '4-2-2', type: 'smoothstep' },
      { id: 'e4-2-4-2-3', source: '4-2', target: '4-2-3', type: 'smoothstep' },

      // Phase 3 動作
      { id: 'e4-3-4-3-1', source: '4-3', target: '4-3-1', type: 'smoothstep' },
      { id: 'e4-3-4-3-2', source: '4-3', target: '4-3-2', type: 'smoothstep' },

      // Phase 4 動作
      { id: 'e4-4-4-4-1', source: '4-4', target: '4-4-1', type: 'smoothstep' },
      { id: 'e4-4-4-4-2', source: '4-4', target: '4-4-2', type: 'smoothstep' },
      { id: 'e4-4-4-4-3', source: '4-4', target: '4-4-3', type: 'smoothstep' },

      // Phase 5 動作
      { id: 'e4-5-4-5-1', source: '4-5', target: '4-5-1', type: 'smoothstep' },
      { id: 'e4-5-4-5-2', source: '4-5', target: '4-5-2', type: 'smoothstep' },

      // Phase 5 的循環箭頭 (回到 Phase 2)
      { id: 'e4-5-2-4-2', source: '4-5-2', target: '4-2', type: 'smoothstep', animated: true, label: '迭代循環' },

      // Gemini API 角色
      { id: 'e5-5-1', source: '5', target: '5-1', type: 'smoothstep' },
      { id: 'e5-5-2', source: '5', target: '5-2', type: 'smoothstep' },
      { id: 'e5-5-3', source: '5', target: '5-3', type: 'smoothstep' },
      { id: 'e5-5-4', source: '5', target: '5-4', type: 'smoothstep' },
      { id: 'e5-5-5', source: '5', target: '5-5', type: 'smoothstep' }
    ]
  },
  tags: ['Gemini', 'SDD', '規格驅動開發', 'Slot Math', '工作流程', 'AI輔助開發'],
  is_public: true
};

// 發送 POST 請求到 API
function createTree(data) {
  const postData = JSON.stringify(data);

  const options = {
    hostname: 'localhost',
    port: 5010,
    path: '/api/trees',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (e) {
            reject(new Error(`解析回應失敗: ${e.message}`));
          }
        } else {
          reject(new Error(`API 請求失敗 (${res.statusCode}): ${responseData}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`請求錯誤: ${e.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// 主程式
async function main() {
  console.log('🚀 開始匯入 GEMINI-SDD-WORKFLOW 樹狀圖...\n');
  
  try {
    console.log('📤 發送資料到 API...');
    const result = await createTree(treeData);
    
    console.log('\n✅ 樹狀圖建立成功!\n');
    console.log('📊 樹狀圖資訊:');
    console.log(`   ID: ${result.id}`);
    console.log(`   UUID: ${result.uuid}`);
    console.log(`   名稱: ${result.name}`);
    console.log(`   描述: ${result.description}`);
    console.log(`   節點數: ${result.node_count}`);
    console.log(`   最大深度: ${result.max_depth}`);
    console.log(`   標籤: ${result.tags.join(', ')}`);
    console.log(`\n🔗 查看樹狀圖: http://localhost:5030/#tree-editor?uuid=${result.uuid}\n`);
    
  } catch (error) {
    console.error('\n❌ 匯入失敗:', error.message);
    process.exit(1);
  }
}

// 執行
main();
