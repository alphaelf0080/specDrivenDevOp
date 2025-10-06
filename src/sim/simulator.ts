import type { SlotSpec } from '../engine/types';
import { SeededRNG } from '../engine/rng';
import { spinGrid, evaluateSpin } from '../engine/slotEngine';
import { computeMetrics, type Metrics } from './metrics';

export type SimulationResult = Metrics & {
  totalWin: number;
  spins: number;
};

export function simulate(spec: SlotSpec, opts: { seed: string; spins: number }): SimulationResult {
  const rng = new SeededRNG(opts.seed);
  const betPerSpin = spec.bet.betPerLine * spec.bet.lines;
  const wins: number[] = [];
  for (let i = 0; i < opts.spins; i++) {
    const grid = spinGrid(spec, rng);
    const result = evaluateSpin(spec, grid);
    wins.push(result.totalWin);
  }
  const m = computeMetrics(wins, betPerSpin);
  return { ...m, totalWin: wins.reduce((a, b) => a + b, 0), spins: opts.spins };
}
