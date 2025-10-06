#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [, , reqArg, resArg, statusArg] = process.argv;
if (!reqArg) {
  console.error('Usage: node scripts/log-request.js "<request>" "<result>" "<status>"');
  process.exit(1);
}

const now = new Date();
const dateStr = now.toISOString().slice(0, 10);
const request = reqArg;
const result = resArg || '';
const status = statusArg || '成功';

const filePath = path.resolve(__dirname, '..', 'request.md');
let content = '';
if (!fs.existsSync(filePath)) {
  content += '# Chat Request Log\n\n';
}

content += `\n---\n\n## ${dateStr}\n\n### 請求\n${request}\n\n### 結果\n${result}\n\n### 狀態\n${status}\n`;

fs.appendFileSync(filePath, content, 'utf8');
console.log('Logged to request.md');
