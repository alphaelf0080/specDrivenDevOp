import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

type Position = { x: number; y: number };
type Node = { id: string; type?: string; position?: Position; data?: any };
type Edge = { id?: string; source: string; target: string; sourceHandle?: string; targetHandle?: string } & Record<string, any>;

function readLayout(file: string): { nodes: Node[]; edges: Edge[]; original: any } {
  const raw = fs.readFileSync(file, 'utf-8');
  const json = JSON.parse(raw);
  if (json && Array.isArray(json.nodes) && Array.isArray(json.edges)) return { nodes: json.nodes, edges: json.edges, original: json };
  if (json && json.layout && Array.isArray(json.layout.nodes) && Array.isArray(json.layout.edges)) return { nodes: json.layout.nodes, edges: json.layout.edges, original: json };
  // 修復：有些誤存把 edges 放到 nodes 裡
  if (json && Array.isArray(json.nodes) && !json.edges) {
    const rawNodes: any[] = json.nodes;
    const fixedNodes: Node[] = [];
    const extractedEdges: Edge[] = [];
    for (const item of rawNodes) {
      if (item && typeof item.source === 'string' && typeof item.target === 'string') {
        extractedEdges.push(item as Edge);
      } else if (item && typeof item.id === 'string') {
        fixedNodes.push(item as Node);
      }
    }
    return { nodes: fixedNodes, edges: extractedEdges, original: json };
  }
  throw new Error('Invalid layout file: ' + file);
}

function writeLayout(file: string, payload: any) {
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8');
}

function angleToSourceHandle(dx: number, dy: number): string {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle >= -45 && angle < 45) return 'source-right';
  if (angle >= 45 && angle < 135) return 'source-bottom';
  if (angle >= 135 || angle < -135) return 'source-left';
  return 'source-top';
}

function angleToTargetHandle(dx: number, dy: number): string {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle >= -45 && angle < 45) return 'target-left';
  if (angle >= 45 && angle < 135) return 'target-top';
  if (angle >= 135 || angle < -135) return 'target-right';
  return 'target-bottom';
}

function coercePos(p: any): Position | undefined {
  if (p && typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y)) {
    return { x: p.x, y: p.y };
  }
  return undefined;
}

const id = process.argv[2] || 'art-mindmap';
const filePath = path.join(DATA_DIR, `${id}-layout.json`);
if (!fs.existsSync(filePath)) {
  console.error(`❌ Not found: ${filePath}`);
  process.exit(1);
}

const { nodes, edges, original } = readLayout(filePath);
const nodeMap = new Map<string, Node>(nodes.map((n: any) => [n.id, n] as const));

let updated = 0;
const nextEdges = edges.map((e: any) => {
  const src = nodeMap.get(e.source);
  const tgt = nodeMap.get(e.target);
  if (!src || !tgt) return e;
  const sp = coercePos((src as any).position || (src as any).data?.position);
  const tp = coercePos((tgt as any).position || (tgt as any).data?.position);
  if (!sp || !tp) return e;

  const hasSrc = typeof e.sourceHandle === 'string';
  const hasTgt = typeof e.targetHandle === 'string';
  if (hasSrc && hasTgt) return e;

  const dxST = tp.x - sp.x;
  const dyST = tp.y - sp.y;
  const dxTS = sp.x - tp.x;
  const dyTS = sp.y - tp.y;

  const sourceHandle = hasSrc ? e.sourceHandle : angleToSourceHandle(dxST, dyST);
  const targetHandle = hasTgt ? e.targetHandle : angleToTargetHandle(dxTS, dyTS);

  updated++;
  return { ...e, sourceHandle, targetHandle };
});

// Keep other fields, update edges, and preserve updatedAt
let payload: any;
if (original && Array.isArray(original.nodes) && Array.isArray(original.edges)) {
  payload = { ...original, nodes, edges: nextEdges };
} else if (original && original.layout && Array.isArray(original.layout.nodes) && Array.isArray(original.layout.edges)) {
  payload = { ...original, layout: { ...original.layout, nodes, edges: nextEdges } };
} else if (original && Array.isArray(original.nodes) && !original.edges) {
  // 修復結構：把 nodes 與 edges 正確分離
  payload = { ...original, nodes, edges: nextEdges };
} else {
  payload = { nodes, edges: nextEdges };
}

writeLayout(filePath, payload);

console.log(`🛠️  Migrated: ${id}`);
console.log(`Edges: ${edges.length}, Updated with handles: ${updated}`);
if (updated === 0) {
  console.log('No changes needed.');
}
