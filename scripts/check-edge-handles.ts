import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function read(file: string) {
  const raw = fs.readFileSync(file, 'utf-8');
  const json = JSON.parse(raw);
  if (json && json.nodes && json.edges) return json;
  if (json && json.layout && json.layout.nodes && json.layout.edges) return json.layout;
  throw new Error('Invalid layout file');
}

const id = process.argv[2] || 'art-mindmap';
const filePath = path.join(DATA_DIR, `${id}-layout.json`);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Not found: ${filePath}`);
  process.exit(1);
}
const layout = read(filePath);
const edges = Array.isArray(layout.edges) ? layout.edges : [];
let missingSrc = 0;
let missingTgt = 0;
for (const e of edges) {
  if (typeof e.sourceHandle !== 'string') missingSrc++;
  if (typeof e.targetHandle !== 'string') missingTgt++;
}
console.log(`Edges: ${edges.length}`);
console.log(`Missing sourceHandle: ${missingSrc}`);
console.log(`Missing targetHandle: ${missingTgt}`);
if (missingSrc || missingTgt) process.exitCode = 2;
else process.exitCode = 0;
