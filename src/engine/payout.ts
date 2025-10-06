import type { SlotSpec } from './types';
import { getLineSymbols, countLeftToRight } from './paylines';

export function isWild(spec: SlotSpec, id: string): boolean {
  return spec.symbols.some((s: SlotSpec['symbols'][number]) => s.id === id && s.type === 'wild');
}

export function isScatter(spec: SlotSpec, id: string): boolean {
  return spec.symbols.some((s: SlotSpec['symbols'][number]) => s.id === id && s.type === 'scatter');
}

function findPay(spec: SlotSpec, symbol: string, ofAKind: number): number | null {
  const entry = spec.paytable.find(
    (p: SlotSpec['paytable'][number]) => p.symbol === symbol && p.ofAKind === ofAKind,
  );
  return entry ? entry.payout : null;
}

export function evaluateLines(spec: SlotSpec, grid: string[][]) {
  const lineWins: Array<{ lineId: string; ofAKind: number; symbol: string; payout: number }> = [];
  const betPerLine = spec.bet.betPerLine;
  for (const line of spec.paylines) {
    const lineSymbols = getLineSymbols(grid, line.pattern);
    const { symbol, count } = countLeftToRight(lineSymbols, (s) => isWild(spec, s));
    if (!symbol || count < 2) continue;
    const pay = findPay(spec, symbol, count);
    if (pay && pay > 0) {
      lineWins.push({ lineId: line.id, ofAKind: count, symbol, payout: pay * betPerLine });
    }
  }
  return lineWins;
}

export function evaluateScatters(spec: SlotSpec, grid: string[][]): number {
  const scatterSymbols = spec.symbols
    .filter((s: SlotSpec['symbols'][number]) => s.type === 'scatter')
    .map((s: SlotSpec['symbols'][number]) => s.id);
  if (scatterSymbols.length === 0) return 0;
  const flat = grid.flat();
  let total = 0;
  for (const sc of scatterSymbols) {
    const count = flat.filter((x) => x === sc).length;
    if (count >= 2) {
      const pay = findPay(spec, sc, count);
      if (pay) total += pay * spec.bet.betPerLine; // simple multiplier
    }
  }
  return total;
}
