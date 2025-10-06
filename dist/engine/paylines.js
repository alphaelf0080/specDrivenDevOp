"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineSymbols = getLineSymbols;
exports.countLeftToRight = countLeftToRight;
function getLineSymbols(grid, pattern) {
    const cols = grid[0].length;
    const out = [];
    for (let c = 0; c < cols; c++) {
        const row = pattern[c] ?? 0;
        out.push(grid[row][c]);
    }
    return out;
}
function countLeftToRight(lineSymbols, isWild) {
    if (lineSymbols.length === 0)
        return { symbol: null, count: 0 };
    // first non-wild determines the paying symbol; leading wilds adopt next symbol
    let paySymbol = null;
    for (const s of lineSymbols) {
        if (!isWild(s)) {
            paySymbol = s;
            break;
        }
    }
    if (!paySymbol)
        return { symbol: null, count: 0 };
    let count = 0;
    for (const s of lineSymbols) {
        if (s === paySymbol || isWild(s))
            count++;
        else
            break;
    }
    return { symbol: paySymbol, count };
}
//# sourceMappingURL=paylines.js.map