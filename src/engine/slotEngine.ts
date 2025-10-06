import type { SlotSpec } from './types';
import type { RNG } from './rng';
import { sampleReelWindow } from './reel';
import { evaluateLines, evaluateScatters } from './payout';

export function spinGrid(spec: SlotSpec, rng: RNG): string[][] {
  const { columns, rows, strips } = spec.reels;
  const grid: string[][] = Array.from({ length: rows }, () => Array(columns).fill(''));
  for (let c = 0; c < columns; c++) {
    const reelWindow = sampleReelWindow(strips[c], rows, rng);
    for (let r = 0; r < rows; r++) {
      grid[r][c] = reelWindow[r];
    }
  }
  return grid;
}

export function evaluateSpin(spec: SlotSpec, grid: string[][]) {
  const lineWins = evaluateLines(spec, grid);
  const scatterWin = evaluateScatters(spec, grid);
  const totalWin = lineWins.reduce((sum, w) => sum + w.payout, 0) + scatterWin;
  return { grid, lineWins, totalWin };
}
