"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulate = simulate;
const rng_1 = require("../engine/rng");
const slotEngine_1 = require("../engine/slotEngine");
const metrics_1 = require("./metrics");
function simulate(spec, opts) {
    const rng = new rng_1.SeededRNG(opts.seed);
    const betPerSpin = spec.bet.betPerLine * spec.bet.lines;
    const wins = [];
    for (let i = 0; i < opts.spins; i++) {
        const grid = (0, slotEngine_1.spinGrid)(spec, rng);
        const result = (0, slotEngine_1.evaluateSpin)(spec, grid);
        wins.push(result.totalWin);
    }
    const m = (0, metrics_1.computeMetrics)(wins, betPerSpin);
    return { ...m, totalWin: wins.reduce((a, b) => a + b, 0), spins: opts.spins };
}
//# sourceMappingURL=simulator.js.map