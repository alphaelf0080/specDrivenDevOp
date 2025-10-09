import { sampleReelWindow } from './reel';
import { evaluateLines, evaluateScatters } from './payout';
export function spinGrid(spec, rng) {
    const { columns, rows, strips } = spec.reels;
    const grid = Array.from({ length: rows }, () => Array(columns).fill(''));
    for (let c = 0; c < columns; c++) {
        const reelWindow = sampleReelWindow(strips[c], rows, rng);
        for (let r = 0; r < rows; r++) {
            grid[r][c] = reelWindow[r];
        }
    }
    return grid;
}
export function evaluateSpin(spec, grid) {
    const lineWins = evaluateLines(spec, grid);
    const scatterWin = evaluateScatters(spec, grid);
    const totalWin = lineWins.reduce((sum, w) => sum + w.payout, 0) + scatterWin;
    return { grid, lineWins, totalWin };
}
//# sourceMappingURL=slotEngine.js.map