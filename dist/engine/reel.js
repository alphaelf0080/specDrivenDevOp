"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleReelWindow = sampleReelWindow;
function sampleReelWindow(strip, rows, rng) {
    if (strip.length === 0)
        return Array(rows).fill('');
    const start = rng.int(strip.length);
    const out = [];
    for (let r = 0; r < rows; r++) {
        out.push(strip[(start + r) % strip.length]);
    }
    return out;
}
//# sourceMappingURL=reel.js.map