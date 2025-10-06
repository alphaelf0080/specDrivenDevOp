"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinGrid = spinGrid;
exports.evaluateSpin = evaluateSpin;
const reel_1 = require("./reel");
const payout_1 = require("./payout");
function spinGrid(spec, rng) {
    const { columns, rows, strips } = spec.reels;
    const grid = Array.from({ length: rows }, () => Array(columns).fill(''));
    for (let c = 0; c < columns; c++) {
        const reelWindow = (0, reel_1.sampleReelWindow)(strips[c], rows, rng);
        for (let r = 0; r < rows; r++) {
            grid[r][c] = reelWindow[r];
        }
    }
    return grid;
}
function evaluateSpin(spec, grid) {
    const lineWins = (0, payout_1.evaluateLines)(spec, grid);
    const scatterWin = (0, payout_1.evaluateScatters)(spec, grid);
    const totalWin = lineWins.reduce((sum, w) => sum + w.payout, 0) + scatterWin;
    return { grid, lineWins, totalWin };
}
//# sourceMappingURL=slotEngine.js.map