// ESM version of the generator to run with `node` directly
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PSD_JSON = path.join(ROOT, 'docs', 'psd_structure.json');
const OUT_DIR = path.join(ROOT, 'docs', 'layout');
const CANVAS_W = 1080;
const CANVAS_H = 1920;

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function readPSD() { return JSON.parse(fs.readFileSync(PSD_JSON, 'utf-8')); }
function pctRect(b) {
  return {
    x: +(b.left / CANVAS_W).toFixed(3),
    y: +(b.top / CANVAS_H).toFixed(3),
    w: +(b.width / CANVAS_W).toFixed(3),
    h: +(b.height / CANVAS_H).toFixed(3),
  };
}
function flatten(nodes, prefix = []) {
  const out = [];
  for (const n of nodes) {
    const id = [...prefix, n.name].join('/');
    const b = n.bounds || { left: 0, top: 0, width: 0, height: 0 };
    const bboxPx = b.width > 0 && b.height > 0 ? { x: b.left, y: b.top, w: b.width, h: b.height } : undefined;
    const bboxPct = bboxPx ? pctRect(b) : undefined;
    out.push({ id, name: n.name, kind: n.kind, path: [...prefix, n.name], bounds: b, bboxPx, bboxPct });
    if (n.children && n.children.length) out.push(...flatten(n.children, [...prefix, n.name]));
  }
  return out;
}
const normName = (s) => s.toLowerCase();
const detectState = (name) => { const n = normName(name); if (n.includes('disable')) return 'disable'; if (n.includes('hover')) return 'hover'; if (n.includes('down')||n.includes('press')) return 'down'; if (n.includes('up')||n.includes('normal')||n.includes('default')) return 'up'; return undefined; };
const detectLang = (name) => { const n = normName(name); if (/(^|[^a-z])tw([^a-z]|$)/.test(n)) return 'tw'; if (/(^|[^a-z])cn([^a-z]|$)/.test(n)) return 'cn'; if (/(^|[^a-z])en([^a-z]|$)/.test(n)) return 'en'; };
const isButton = (name) => { const n = normName(name); return n.startsWith('btn_') || /\bbtn\b/.test(n); };
const buttonKey = (name) => { const n = normName(name); if (n.startsWith('btn_')) return n.replace('btn_', '').replace(/_(up|down|hover|disable).*/, ''); return undefined; };
const isBFG = (name) => { const n = normName(name); return n.includes('bfg') || n.includes('購買免費遊戲'); };
const isGlyphGroup = (name) => normName(name).startsWith('num_bfg');
const isReelGrid = (name) => name.includes('sym定位');
const isBackground = (name) => { const n = normName(name); return n.startsWith('bg_') || n.includes('background') || n === 'sky'; };
const isLogo = (name) => { const n = normName(name); return n.startsWith('tx_logo') || n.startsWith('tx_loading_logo') || n === 'logo'; };
const isMarquee = (name) => { const n = normName(name); return n.includes('marquee') || n.includes('tx_marquee'); };
const isJP = (name) => { const n = normName(name); return n === 'jp' || n.startsWith('jp_') || n.includes('jackpot'); };
const isTransitionOrLoading = (name) => { const n = normName(name); return n.includes('transition') || n.includes('loading') || n.startsWith('ani_'); };
const isSymbol = (name) => { const n = normName(name); return n.startsWith('sym_') || n.startsWith('wild') || n.startsWith('scatter') || n === 'wild' || n === 'scatter'; };
const toBBox = (obj) => obj && { x: obj.x, y: obj.y, w: obj.w, h: obj.h };

function main() {
  ensureDir(OUT_DIR);
  const tree = readPSD();
  const flat = flatten(tree);

  const uiButtons = {};
  for (const n of flat) {
    if (isButton(n.name) && n.bboxPx) {
      const key = buttonKey(n.name) || n.name.toLowerCase();
      const state = detectState(n.name) || 'up';
      uiButtons[key] = uiButtons[key] || { states: {} };
      uiButtons[key].states[state] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
    }
  }

  const bfg = { button: { states: {} }, texts: {}, numbers: { states: {} } };
  for (const n of flat) {
    if (isBFG(n.name) && isButton(n.name) && n.bboxPx) {
      const state = detectState(n.name) || 'up';
      bfg.button.states[state] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
    }
    const state = detectState(n.name);
    const lang = detectLang(n.name);
    if (isBFG(n.name) && !isButton(n.name) && n.bboxPx && state && lang) {
      bfg.texts[state] = bfg.texts[state] || {};
      bfg.texts[state][lang] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
    }
  }
  for (const group of flat.filter(f => f.kind === 'group' && isGlyphGroup(f.name))) {
    const groupPath = group.path.join('/');
    const state = detectState(group.name) || 'up';
    const glyphs = {};
    for (const n of flat) {
      if (n.id.startsWith(groupPath + '/') && n.kind === 'layer' && n.bboxPx) {
        glyphs[n.name] = { bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
      }
    }
    if (Object.keys(glyphs).length) bfg.numbers.states[state] = { glyphs };
  }

  const reel = { meta: { canvas: { width: CANVAS_W, height: CANVAS_H }, grid: { cols: 0, rows: 0 } }, cells: [] };
  const gridGroup = flat.find(f => f.kind === 'group' && isReelGrid(f.name));
  if (gridGroup) {
    const groupPath = gridGroup.path.join('/');
    const cells = flat.filter(n => n.id.startsWith(groupPath + '/') && n.kind === 'layer' && n.bboxPx);
    const sorted = cells.map(c => ({ ...c, cx: c.bboxPx.x + c.bboxPx.w/2, cy: c.bboxPx.y + c.bboxPx.h/2 }))
      .sort((a,b) => (a.cy-b.cy) || (a.cx-b.cx));
    const rows = [];
    const rowThreshold = 30;
    for (const c of sorted) {
      let placed = false;
      for (const row of rows) {
        const avgY = row.reduce((s,r) => s + (r.bboxPx.y + r.bboxPx.h/2), 0) / row.length;
        if (Math.abs(avgY - (c.bboxPx.y + c.bboxPx.h/2)) <= rowThreshold) { row.push(c); placed = true; break; }
      }
      if (!placed) rows.push([c]);
    }
    rows.forEach(r => r.sort((a,b) => a.bboxPx.x - b.bboxPx.x));
    const cols = Math.max(...rows.map(r => r.length));
    reel.meta.grid = { cols, rows: rows.length };
    rows.forEach((r, rowIdx) => r.forEach((c, colIdx) => {
      reel.cells.push({ col: colIdx, row: rowIdx, bboxPx: toBBox(c.bboxPx), bboxPct: c.bboxPct });
    }));
  }

  const backgrounds = [], logos = [], marquees = [], jps = [], transitions = [], symbols = [], reelExtras = [];
  for (const n of flat) {
    if (!n.bboxPx) continue;
    const rec = { name: n.name, path: n.id, bboxPx: toBBox(n.bboxPx), bboxPct: n.bboxPct };
    if (isBackground(n.name)) backgrounds.push(rec);
    else if (isLogo(n.name)) logos.push(rec);
    else if (isMarquee(n.name)) marquees.push(rec);
    else if (isJP(n.name)) jps.push(rec);
    else if (isTransitionOrLoading(n.name)) transitions.push(rec);
    else if (isSymbol(n.name)) symbols.push(rec);
    else if (normName(n.name).includes('bg_reel')) reelExtras.push(rec);
  }

  // Build a flattened catalog for full coverage (lightweight fields only)
  const flatCatalog = flat.map(n => ({
    id: n.id,
    name: n.name,
    kind: n.kind,
    path: n.path,
    bboxPx: n.bboxPx || null,
    bboxPct: n.bboxPct || null,
  }));

  const manifest = {
    meta: { canvas: { width: CANVAS_W, height: CANVAS_H }, source: path.relative(ROOT, PSD_JSON), generatedAt: new Date().toISOString() },
    byCategory: { backgrounds, ui: { buttons: uiButtons }, bfg, reel: { ...reel, extras: reelExtras }, symbols, marquee: marquees, logo: logos, jp: jps, transitions },
    flat: flatCatalog,
  };

  ensureDir(OUT_DIR);
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'ui_layout.json'), JSON.stringify({ meta: { canvas: { width: CANVAS_W, height: CANVAS_H } }, buttons: uiButtons }, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'bfg_layout.json'), JSON.stringify({ meta: { canvas: { width: CANVAS_W, height: CANVAS_H } }, ...bfg }, null, 2));
  if (reel.cells.length) fs.writeFileSync(path.join(OUT_DIR, 'reel_layout.json'), JSON.stringify(reel, null, 2));
  console.log('Generated layout files in', path.relative(ROOT, OUT_DIR));
}

main();
