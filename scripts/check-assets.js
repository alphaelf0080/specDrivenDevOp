#!/usr/bin/env node
/**
 * Asset Checker Script
 * 檢查資產檔案是否符合命名規範與規格要求
 * 
 * Usage:
 *   node scripts/check-assets.js --spec src/specs/games/my-game.json --assets assets/
 */

const fs = require('fs');
const path = require('path');

// 解析命令列參數
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

const specPath = getArg('--spec');
const assetsDir = getArg('--assets') || 'assets';

if (!specPath) {
  console.error('❌ 錯誤：請指定規格檔案路徑');
  console.log('用法：node scripts/check-assets.js --spec <spec-file> [--assets <assets-dir>]');
  process.exit(1);
}

// 讀取規格檔
let spec;
try {
  spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
} catch (error) {
  console.error(`❌ 無法讀取規格檔：${specPath}`);
  console.error(error.message);
  process.exit(1);
}

console.log('🔍 Asset Checker');
console.log('================\n');
console.log(`規格檔：${specPath}`);
console.log(`資產目錄：${assetsDir}\n`);

// 檢查結果統計
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: [],
};

// 1. 檢查符號資產
console.log('📦 檢查符號資產...');
const symbols = spec.symbols || [];
const requiredStates = ['normal']; // 必需狀態
const optionalStates = ['glow', 'blur']; // 選配狀態

symbols.forEach((symbol) => {
  const symbolId = symbol.id;
  
  requiredStates.forEach((state) => {
    results.total++;
    const filename = `sym_${symbolId}_${state}.png`;
    const filepath = path.join(assetsDir, 'symbols', filename);
    
    if (fs.existsSync(filepath)) {
      results.passed++;
      console.log(`  ✅ ${filename}`);
      
      // 檢查檔案大小
      const stats = fs.statSync(filepath);
      const sizeKB = stats.size / 1024;
      if (sizeKB > 200) {
        results.warnings.push(`${filename} 檔案過大：${sizeKB.toFixed(1)} KB > 200 KB`);
      }
    } else {
      results.failed++;
      results.errors.push(`缺少符號資產：${filename}`);
      console.log(`  ❌ ${filename} (缺少)`);
    }
  });
  
  // 檢查選配狀態（僅警告）
  optionalStates.forEach((state) => {
    const filename = `sym_${symbolId}_${state}.png`;
    const filepath = path.join(assetsDir, 'symbols', filename);
    
    if (!fs.existsSync(filepath)) {
      results.warnings.push(`選配資產未提供：${filename}`);
    }
  });
});

console.log('');

// 2. 檢查按鈕資產
console.log('🔘 檢查按鈕資產...');
const buttons = ['spin', 'info', 'settings', 'menu', 'close'];
const buttonStates = ['up', 'hover', 'down', 'disable'];

buttons.forEach((button) => {
  buttonStates.forEach((state) => {
    results.total++;
    const filename = `btn_${button}_${state}.png`;
    const filepath = path.join(assetsDir, 'buttons', filename);
    
    if (fs.existsSync(filepath)) {
      results.passed++;
      console.log(`  ✅ ${filename}`);
      
      // 檢查檔案大小
      const stats = fs.statSync(filepath);
      const sizeKB = stats.size / 1024;
      if (sizeKB > 200) {
        results.warnings.push(`${filename} 檔案過大：${sizeKB.toFixed(1)} KB > 200 KB`);
      }
    } else {
      // 只有 spin 按鈕是必需的，其他為警告
      if (button === 'spin') {
        results.failed++;
        results.errors.push(`缺少必需按鈕：${filename}`);
        console.log(`  ❌ ${filename} (缺少)`);
      } else {
        results.warnings.push(`選配按鈕未提供：${filename}`);
        console.log(`  ⚠️  ${filename} (選配)`);
      }
    }
  });
});

console.log('');

// 3. 檢查背景資產
console.log('🖼️  檢查背景資產...');
const backgrounds = ['bg_mg.jpg', 'bg_reel.png'];

backgrounds.forEach((filename) => {
  results.total++;
  const filepath = path.join(assetsDir, 'bg', filename);
  
  if (fs.existsSync(filepath)) {
    results.passed++;
    console.log(`  ✅ ${filename}`);
    
    // 檢查檔案大小
    const stats = fs.statSync(filepath);
    const sizeKB = stats.size / 1024;
    if (sizeKB > 500) {
      results.warnings.push(`${filename} 檔案過大：${sizeKB.toFixed(1)} KB > 500 KB`);
    }
  } else {
    results.failed++;
    results.errors.push(`缺少背景資產：${filename}`);
    console.log(`  ❌ ${filename} (缺少)`);
  }
});

console.log('');

// 4. 檢查多語系資產
console.log('🌐 檢查多語系資產...');
const languages = ['cn', 'tw', 'en'];
const i18nAssets = ['tx_logo'];

i18nAssets.forEach((assetName) => {
  languages.forEach((lang) => {
    results.total++;
    const filename = `${assetName}_${lang}.png`;
    const filepath = path.join(assetsDir, 'text', lang, filename);
    
    if (fs.existsSync(filepath)) {
      results.passed++;
      console.log(`  ✅ ${filename}`);
    } else {
      results.warnings.push(`多語系資產未提供：${filename}`);
      console.log(`  ⚠️  ${filename} (選配)`);
    }
  });
});

console.log('');

// 5. 檢查命名規範
console.log('📝 檢查命名規範...');
const checkNamingConvention = (dir) => {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const files = fs.readdirSync(dir, { recursive: true });
  files.forEach((file) => {
    if (typeof file !== 'string') return;
    
    const basename = path.basename(file);
    
    // 跳過目錄和 manifest
    if (!basename.includes('.') || basename === 'manifest.json') return;
    
    // 檢查大寫字母
    if (/[A-Z]/.test(basename)) {
      results.warnings.push(`檔名含大寫字母：${basename}`);
    }
    
    // 檢查空格或連字號
    if (/[\s-]/.test(basename)) {
      results.warnings.push(`檔名含空格或連字號：${basename}`);
    }
    
    // 檢查是否符合標準格式
    const validPrefixes = ['bg_', 'sym_', 'btn_', 'tx_', 'icon_', 'num_', 'pic_', 'line_', 'sfx_', 'bgm_'];
    const hasValidPrefix = validPrefixes.some(prefix => basename.startsWith(prefix));
    
    if (!hasValidPrefix && !basename.startsWith('.')) {
      results.warnings.push(`檔名不符合命名規範：${basename}`);
    }
  });
};

checkNamingConvention(assetsDir);

// 6. 產出報告
console.log('');
console.log('📊 檢查報告');
console.log('==========\n');
console.log(`總檢查項目：${results.total}`);
console.log(`✅ 通過：${results.passed}`);
console.log(`❌ 失敗：${results.failed}`);
console.log(`⚠️  警告：${results.warnings.length}\n`);

if (results.errors.length > 0) {
  console.log('🚨 錯誤列表：');
  results.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
  console.log('');
}

if (results.warnings.length > 0) {
  console.log('⚠️  警告列表：');
  results.warnings.slice(0, 10).forEach((warning, index) => {
    console.log(`  ${index + 1}. ${warning}`);
  });
  if (results.warnings.length > 10) {
    console.log(`  ... 及其他 ${results.warnings.length - 10} 項警告`);
  }
  console.log('');
}

// 7. 產出 JSON 報告
const reportPath = 'reports/asset-check-report.json';
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const report = {
  timestamp: new Date().toISOString(),
  spec: specPath,
  assetsDir: assetsDir,
  summary: {
    total: results.total,
    passed: results.passed,
    failed: results.failed,
    warnings: results.warnings.length,
  },
  errors: results.errors,
  warnings: results.warnings,
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 詳細報告已存至：${reportPath}\n`);

// 8. 退出碼
if (results.failed > 0) {
  console.log('❌ 檢查失敗：存在必需資產缺失');
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log('⚠️  檢查通過（有警告）');
  process.exit(0);
} else {
  console.log('✅ 所有檢查通過');
  process.exit(0);
}
