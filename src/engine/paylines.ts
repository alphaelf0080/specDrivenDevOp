import type { Grid } from './types';

export function getLineSymbols(grid: Grid, pattern: number[]): string[] {
  const cols = grid[0].length;
  const out: string[] = [];
  for (let c = 0; c < cols; c++) {
    const row = pattern[c] ?? 0;
    out.push(grid[row][c]);
  }
  return out;
}

export function countLeftToRight(
  lineSymbols: string[],
  isWild: (s: string) => boolean,
): {
  symbol: string | null;
  count: number;
} {
  if (lineSymbols.length === 0) return { symbol: null, count: 0 };
  // first non-wild determines the paying symbol; leading wilds adopt next symbol
  let paySymbol: string | null = null;
  for (const s of lineSymbols) {
    if (!isWild(s)) {
      paySymbol = s;
      break;
    }
  }
  if (!paySymbol) return { symbol: null, count: 0 };
  let count = 0;
  for (const s of lineSymbols) {
    if (s === paySymbol || isWild(s)) count++;
    else break;
  }
  return { symbol: paySymbol, count };
}
