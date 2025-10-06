"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMetrics = computeMetrics;
function computeMetrics(wins, betPerSpin) {
    const n = wins.length;
    const totalWin = wins.reduce((a, b) => a + b, 0);
    const totalBet = betPerSpin * n;
    const rtp = totalBet > 0 ? totalWin / totalBet : 0;
    const hits = wins.filter((w) => w > 0).length;
    const hitRate = n > 0 ? hits / n : 0;
    const mean = n > 0 ? totalWin / n : 0;
    const variance = n > 1 ? wins.reduce((s, w) => s + (w - mean) ** 2, 0) / (n - 1) : 0;
    const volatility = Math.sqrt(variance);
    return { rtp, hitRate, volatility };
}
//# sourceMappingURL=metrics.js.map