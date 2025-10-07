/*
  Parse docs/psd_structure.json and produce comprehensive layout JSONs:
  - docs/layout/manifest.json (full catalog by categories and raw tree)
  - docs/layout/ui_layout.json (buttons with states)
  - docs/layout/bfg_layout.json (BFG button + texts + glyphs)
  - docs/layout/reel_layout.json (5x4 grid if found; else empty)
*/
import fs from 'fs';
import path from 'path';

type Bounds = { left: number; top: number; right: number; bottom: number; width: number; height: number };
type Node = {
  name: string;
  kind: 'group' | 'layer';
  visible?: boolean;
  opacity?: number;
  blend_mode?: string;
  clipping?: boolean;
  mask?: boolean;
  bounds: Bounds;
  text?: any;
  smart_object?: any;
  children?: Node[];
};

const ROOT = process.cwd();
const PSD_JSON = path.join(ROOT, 'docs', 'psd_structure.json');
const OUT_DIR = path.join(ROOT, 'docs', 'layout');
const CANVAS_W = 1080;
const CANVAS_H = 1920;

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function readPSD(): Node[] {
  const raw = fs.readFileSync(PSD_JSON, 'utf-8');
  return JSON.parse(raw) as Node[];
}

function pctRect(b: Bounds) {
  return {
    x: +(b.left / CANVAS_W).toFixed(3),
    y: +(b.top / CANVAS_H).toFixed(3),
    w: +(b.width / CANVAS_W).toFixed(3),
    h: +(b.height / CANVAS_H).toFixed(3),
  };
}

type FlatNode = {
  id: string; // path joined by '/'
  name: string;
  kind: 'group' | 'layer';
  path: string[];
  bounds: Bounds;
  bboxPx?: { x: number; y: number; w: number; h: number };
  bboxPct?: { x: number; y: number; w: number; h: number };
};

function flatten(nodes: Node[], prefix: string[] = []): FlatNode[] {
  const out: FlatNode[] = [];
  for (const n of nodes) {
    const id = [...prefix, n.name].join('/');
    const b = n.bounds;
    const bboxPx = b.width > 0 && b.height > 0 ? { x: b.left, y: b.top, w: b.width, h: b.height } : undefined;
    const bboxPct = bboxPx ? pctRect(b) : undefined;
    out.push({ id, name: n.name, kind: n.kind, path: [...prefix, n.name], bounds: b, bboxPx, bboxPct });
    if (n.children && n.children.length) out.push(...flatten(n.children, [...prefix, n.name]));
  }
  return out;
}

function normName(s: string) {
  return s.toLowerCase();
}

function detectState(name: string): 'up' | 'hover' | 'down' | 'disable' | undefined {
  const n = normName(name);
  if (n.includes('disable') || n.includes('disabled')) return 'disable';
  if (n.includes('hover')) return 'hover';
  if (n.includes('down') || n.includes('press')) return 'down';
  if (n.includes('up') || n.includes('normal') || n.includes('default')) return 'up';
  return undefined;
}

function detectLang(name: string): 'cn' | 'tw' | 'en' | undefined {
  const n = normName(name);
  if (/(^|[^a-z])tw([^a-z]|$)/.test(n)) return 'tw';
  if (/(^|[^a-z])cn([^a-z]|$)/.test(n)) return 'cn';
  if (/(^|[^a-z])en([^a-z]|$)/.test(n)) return 'en';
  return undefined;
}

function isButton(name: string) {
  const n = normName(name);
  return n.startsWith('btn_') || /\bbtn\b/.test(n);
}

function buttonKey(name: string) {
  // btn_spin_up -> spin, btn_bet_increase -> bet_increase
  const n = normName(name);
  const m = n.match(/btn_([^_]+)/);
  if (m) return n.replace('btn_', '').replace(/_(up|down|hover|disable).*/, '');
  return undefined;
}

function isBFG(name: string) {
  const n = normName(name);
  return n.includes('bfg') || n.includes('購買免費遊戲');
}

function isGlyphGroup(name: string) {
  const n = normName(name);
  return n.startsWith('num_bfg');
}

function isReelGrid(name: string) {
  // sym定位 group
  return name.includes('sym定位');
}

function isBackground(name: string) {
  const n = normName(name);
  return n.startsWith('bg_') || n.includes('background') || n === 'sky';
}

function isLogo(name: string) {
  const n = normName(name);
  return n.startsWith('tx_logo') || n.startsWith('tx_loading_logo') || n === 'logo';
}

function isMarquee(name: string) {
  const n = normName(name);
  return n.includes('marquee') || n.includes('tx_marquee');
}

function isJP(name: string) {
  const n = normName(name);
  return n === 'jp' || n.startsWith('jp_') || n.includes('jackpot');
}

function isTransitionOrLoading(name: string) {
  const n = normName(name);
  return n.includes('transition') || n.includes('loading') || n.startsWith('ani_');
}

function isSymbol(name: string) {
  const n = normName(name);
  return n.startsWith('sym_') || n.startsWith('wild') || n.startsWith('scatter') || n === 'wild' || n === 'scatter';
}

function toBBox(obj?: { x: number; y: number; w: number; h: number }) {
  if (!obj) return undefined;
  return { x: obj.x, y: obj.y, w: obj.w, h: obj.h };
}

function main() {
  ensureDir(OUT_DIR);
  const tree = readPSD();
  const flat = flatten(tree);

  // UI Buttons
  const uiButtons: Record<string, { role?: string; states: Record<string, any> }> = {};
  for (const n of flat) {
    if (isButton(n.name) && n.bboxPx) {
      const key = buttonKey(n.name) || n.name.toLowerCase();
      const state = detectState(n.name) || 'up';
      uiButtons[key] = uiButtons[key] || { states: {} };
      uiButtons[key].states[state] = {
        bboxPx: toBBox(n.bboxPx),
        bboxPct: n.bboxPct,
      };
    }
  }

  // BFG: button + texts + numbers glyphs
  const bfg: any = { button: { states: {} }, texts: {}, numbers: { states: {} } };
  for (const n of flat) {
    if (isBFG(n.name) && isButton(n.name) && n.bboxPx) {
      const state = detectState(n.name) || 'up';
      bfg.button.states[state] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
    }
    // texts layers with language hints
    if (isBFG(n.name) && !isButton(n.name) && n.bboxPx) {
      const state = detectState(n.name);
      const lang = detectLang(n.name);
      if (state && lang) {
        bfg.texts[state] = bfg.texts[state] || {};
        bfg.texts[state][lang] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
      }
    }
  }
  // numbers glyphs (num_bfg*)
  for (const group of flat.filter(f => f.kind === 'group' && isGlyphGroup(f.name))) {
    // list children of this group from original tree path
    const groupPath = group.path.join('/');
    const state = detectState(group.name) || 'up';
    const glyphs: Record<string, any> = {};
    for (const n of flat) {
      if (n.id.startsWith(groupPath + '/') && n.kind === 'layer' && n.bboxPx) {
        const gname = normName(n.name).replace('glyph_', '').replace('num_', '').trim();
        glyphs[n.name] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
      }
    }
    if (Object.keys(glyphs).length) bfg.numbers.states[state] = { glyphs };
  }

  // Reel grid (sym定位)
  const reel: any = { meta: { canvas: { width: CANVAS_W, height: CANVAS_H }, grid: { cols: 0, rows: 0 } }, cells: [] as any[] };
  const gridGroup = flat.find(f => f.kind === 'group' && isReelGrid(f.name));
  if (gridGroup) {
    const groupPath = gridGroup.path.join('/');
    const cells = flat.filter(n => n.id.startsWith(groupPath + '/') && n.kind === 'layer' && n.bboxPx);
    // Sort into columns/rows by x,y
    const sorted = cells
      .map(c => ({ ...c, cx: c.bboxPx!.x + c.bboxPx!.w / 2, cy: c.bboxPx!.y + c.bboxPx!.h / 2 }))
      .sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
    // cluster rows by y
    const rows: FlatNode[][] = [];
    const rowThreshold = 30; // px tolerance
    for (const c of sorted) {
      let placed = false;
      for (const row of rows) {
        const avgY = row.reduce((s, r) => s + (r.bboxPx!.y + r.bboxPx!.h / 2), 0) / row.length;
        if (Math.abs(avgY - (c.bboxPx!.y + c.bboxPx!.h / 2)) <= rowThreshold) {
          row.push(c);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([c]);
    }
    // sort each row by x
    rows.forEach(r => r.sort((a, b) => a.bboxPx!.x - b.bboxPx!.x));
    const cols = Math.max(...rows.map(r => r.length));
    reel.meta.grid = { cols, rows: rows.length };
    rows.forEach((r, rowIdx) => {
      r.forEach((c, colIdx) => {
        reel.cells.push({ col: colIdx, row: rowIdx, bboxPx: toBBox(c.bboxPx), bboxPct: c.bboxPct });
      });
    });
  }

  // Backgrounds, Logos, Marquee, JP, Transitions/Loading, Symbols
  const backgrounds: any[] = [];
  const logos: any[] = [];
  const marquees: any[] = [];
  const jps: any[] = [];
  const transitions: any[] = [];
  const symbols: any[] = [];
  const reelExtras: any[] = [];

  for (const n of flat) {
    if (!n.bboxPx) continue;
    if (isBackground(n.name)) backgrounds.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (isLogo(n.name)) logos.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (isMarquee(n.name)) marquees.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (isJP(n.name)) jps.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (isTransitionOrLoading(n.name)) transitions.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (isSymbol(n.name)) symbols.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
    else if (normName(n.name).includes('bg_reel')) reelExtras.push({ name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct });
  }

  // Manifest assembly
  const manifest = {
    meta: {
      canvas: { width: CANVAS_W, height: CANVAS_H },
      source: path.relative(ROOT, PSD_JSON),
      generatedAt: new Date().toISOString(),
    },
    byCategory: {
      backgrounds,
      ui: { buttons: uiButtons },
      bfg,
      reel: { ...reel, extras: reelExtras },
      symbols,
      marquee: marquees,
      logo: logos,
      jp: jps,
      transitions,
    },
  } as const;

  // Write outputs
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  // Specialized files regenerated from manifest
  const ui_layout = { meta: { canvas: { width: CANVAS_W, height: CANVAS_H } }, buttons: uiButtons };
  fs.writeFileSync(path.join(OUT_DIR, 'ui_layout.json'), JSON.stringify(ui_layout, null, 2), 'utf-8');

  fs.writeFileSync(path.join(OUT_DIR, 'bfg_layout.json'), JSON.stringify({ meta: { canvas: { width: CANVAS_W, height: CANVAS_H } }, ...bfg }, null, 2), 'utf-8');

  if (reel.cells.length) {
    fs.writeFileSync(path.join(OUT_DIR, 'reel_layout.json'), JSON.stringify(reel, null, 2), 'utf-8');
  }

  console.log('Generated layout files in', path.relative(ROOT, OUT_DIR));
}

main();
