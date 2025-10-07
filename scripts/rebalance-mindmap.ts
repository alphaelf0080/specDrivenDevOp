import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type Position = { x: number; y: number };
type Node = {
  id: string;
  label?: string;
  type?: string;
  position?: Position;
  [key: string]: any;
};
type Edge = { id?: string; source: string; target: string; [key: string]: any };
type Layout = { nodes: Node[]; edges: Edge[]; updatedAt?: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function readLayout(filePath: string): Layout {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  if (json && json.nodes && json.edges) return json as Layout;
  if (json && json.layout && json.layout.nodes && json.layout.edges) return json.layout as Layout;
  throw new Error('Invalid layout file structure');
}

function writeLayout(filePath: string, layout: Layout) {
  const payload = { nodes: layout.nodes, edges: layout.edges, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

function ensurePos(p?: Position): Position {
  if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return { x: 0, y: 0 };
  return p;
}

function getRootId(nodes: Node[]): string | null {
  const rootById = nodes.find((n) => n.id === 'root');
  if (rootById) return rootById.id;
  const rootByType = nodes.find((n) => n.type === 'root' || n.data?.type === 'root');
  return rootByType ? rootByType.id : null;
}

function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const arr = adj.get(e.source) || [];
    arr.push(e.target);
    adj.set(e.source, arr);
  }
  return adj;
}

function collectSubtree(startId: string, adj: Map<string, string[]>): Set<string> {
  const visited = new Set<string>();
  const stack = [startId];
  while (stack.length) {
    const id = stack.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const children = adj.get(id) || [];
    for (const c of children) stack.push(c);
  }
  return visited;
}

type SubtreeInfo = { id: string; nodes: Set<string>; minY: number; maxY: number; height: number; centerY: number };

function getSubtreeInfo(childId: string, adj: Map<string, string[]>, nodesById: Map<string, Node>): SubtreeInfo {
  const ids = collectSubtree(childId, adj);
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const id of ids) {
    const n = nodesById.get(id);
    if (!n) continue;
    const p = ensurePos(n.position);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
    minY = 0; maxY = 0;
  }
  const height = Math.max(100, maxY - minY + 80); // 最小高度，避免貼太近
  const centerY = (minY + maxY) / 2;
  return { id: childId, nodes: ids, minY, maxY, height, centerY };
}

function rebalance(layout: Layout, xGap = 360, padding = 80): Layout {
  const nodesById = new Map(layout.nodes.map((n) => [n.id, n] as const));
  const adj = buildAdjacency(layout.edges);
  const rootId = getRootId(layout.nodes);
  if (!rootId) {
    throw new Error('Root node not found (expect id="root" or type="root")');
  }
  const root = nodesById.get(rootId)!;
  root.position = ensurePos(root.position);
  const rootPos = root.position!;

  // Immediate children of root
  const childIds = (adj.get(rootId) || []);
  const children = childIds.map((id) => nodesById.get(id)).filter(Boolean) as Node[];
  if (children.length === 0) return layout;

  // 針對每個子樹計算實際高度，採用最小高度保護，並用原本中心 Y 進行排序
  const infos = childIds.map((id) => getSubtreeInfo(id, adj, nodesById));
  infos.sort((a, b) => a.centerY - b.centerY);

  // 根據子節點原始 X 與根比較決定左右側，避免跨側造成交叉
  const leftInfos: SubtreeInfo[] = [];
  const rightInfos: SubtreeInfo[] = [];
  children.forEach((child) => {
    const info = infos.find((s) => s.id === child.id)!;
    const cpos = ensurePos(child.position);
    if (cpos.x >= rootPos.x) rightInfos.push(info);
    else leftInfos.push(info);
  });
  // 各側依中心 Y 排序（自上而下），以維持順序並降低交叉
  leftInfos.sort((a, b) => a.centerY - b.centerY);
  rightInfos.sort((a, b) => a.centerY - b.centerY);

  // 各側總高度（含 padding）
  const sumHeight = (arr: SubtreeInfo[]) => arr.reduce((acc, s) => acc + s.height, 0) + Math.max(0, arr.length - 1) * padding;
  const leftTotal = sumHeight(leftInfos);
  const rightTotal = sumHeight(rightInfos);

  // 讓各側垂直置中：從 rootY - total/2 開始往下堆疊
  const leftStart = rootPos.y - leftTotal / 2;
  const rightStart = rootPos.y - rightTotal / 2;

  // 計算每個子樹的錨點（anchorY 指子樹「中心」對齊之位置）
  const targetAnchors = new Map<string, Position>();
  let cursor = rightStart;
  rightInfos.forEach((s, i) => {
    const anchorY = cursor + s.height / 2;
    targetAnchors.set(s.id, { x: rootPos.x + xGap, y: anchorY });
    cursor += s.height + (i < rightInfos.length - 1 ? padding : 0);
  });
  cursor = leftStart;
  leftInfos.forEach((s, i) => {
    const anchorY = cursor + s.height / 2;
    targetAnchors.set(s.id, { x: rootPos.x - xGap, y: anchorY });
    cursor += s.height + (i < leftInfos.length - 1 ? padding : 0);
  });

  // For each subtree, translate all nodes so that the child moves to its anchor
  for (const info of infos) {
    const childNode = nodesById.get(info.id);
    if (!childNode) continue;
    childNode.position = ensurePos(childNode.position);
    const anchor = targetAnchors.get(info.id)!;
    const dx = anchor.x - childNode.position!.x;
    const dy = anchor.y - childNode.position!.y;
    if (dx === 0 && dy === 0) continue;
    for (const id of info.nodes) {
      const n = nodesById.get(id);
      if (!n) continue;
      n.position = ensurePos(n.position);
      n.position.x += dx;
      n.position.y += dy;
    }
  }

  return { ...layout, nodes: Array.from(nodesById.values()) };
}

async function main() {
  const idArg = process.argv[2] || 'art-mindmap';
  const xGapArg = Number(process.argv[3]);
  const paddingArg = Number(process.argv[4]);
  const filePath = path.join(DATA_DIR, `${idArg}-layout.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Layout file not found: ${filePath}`);
    process.exit(1);
  }
  const xGap = Number.isFinite(xGapArg) ? xGapArg : 360;
  const padding = Number.isFinite(paddingArg) ? paddingArg : 80;
  console.log(`🔧 Rebalancing mindmap: ${idArg} (xGap=${xGap}, padding=${padding})`);
  const layout = readLayout(filePath);
  const result = rebalance(layout, xGap, padding);
  writeLayout(filePath, result);
  console.log(`✅ Rebalanced and saved: ${filePath}`);
}

main().catch((err) => {
  console.error('❌ Rebalance error:', err);
  process.exit(1);
});
