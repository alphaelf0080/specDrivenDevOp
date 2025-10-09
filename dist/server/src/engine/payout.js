import { getLineSymbols, countLeftToRight } from './paylines';
export function isWild(spec, id) {
    return spec.symbols.some((s) => s.id === id && s.type === 'wild');
}
export function isScatter(spec, id) {
    return spec.symbols.some((s) => s.id === id && s.type === 'scatter');
}
function findPay(spec, symbol, ofAKind) {
    const entry = spec.paytable.find((p) => p.symbol === symbol && p.ofAKind === ofAKind);
    return entry ? entry.payout : null;
}
export function evaluateLines(spec, grid) {
    const lineWins = [];
    const betPerLine = spec.bet.betPerLine;
    for (const line of spec.paylines) {
        const lineSymbols = getLineSymbols(grid, line.pattern);
        const { symbol, count } = countLeftToRight(lineSymbols, (s) => isWild(spec, s));
        if (!symbol || count < 2)
            continue;
        const pay = findPay(spec, symbol, count);
        if (pay && pay > 0) {
            lineWins.push({ lineId: line.id, ofAKind: count, symbol, payout: pay * betPerLine });
        }
    }
    return lineWins;
}
export function evaluateScatters(spec, grid) {
    const scatterSymbols = spec.symbols
        .filter((s) => s.type === 'scatter')
        .map((s) => s.id);
    if (scatterSymbols.length === 0)
        return 0;
    const flat = grid.flat();
    let total = 0;
    for (const sc of scatterSymbols) {
        const count = flat.filter((x) => x === sc).length;
        if (count >= 2) {
            const pay = findPay(spec, sc, count);
            if (pay)
                total += pay * spec.bet.betPerLine; // simple multiplier
        }
    }
    return total;
}
//# sourceMappingURL=payout.js.map