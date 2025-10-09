import { SeededRNG } from '../engine/rng';
import { spinGrid, evaluateSpin } from '../engine/slotEngine';
import { computeMetrics } from './metrics';
export function simulate(spec, opts) {
    const rng = new SeededRNG(opts.seed);
    const betPerSpin = spec.bet.betPerLine * spec.bet.lines;
    const wins = [];
    for (let i = 0; i < opts.spins; i++) {
        const grid = spinGrid(spec, rng);
        const result = evaluateSpin(spec, grid);
        wins.push(result.totalWin);
    }
    const m = computeMetrics(wins, betPerSpin);
    return { ...m, totalWin: wins.reduce((a, b) => a + b, 0), spins: opts.spins };
}
//# sourceMappingURL=simulator.js.map