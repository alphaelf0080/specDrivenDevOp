import seedrandom from 'seedrandom';
export class SeededRNG {
    constructor(seed) {
        this.rng = seedrandom(seed, { global: false });
    }
    next() {
        return this.rng.quick();
    }
    int(maxExclusive) {
        return Math.floor(this.next() * maxExclusive);
    }
}
//# sourceMappingURL=rng.js.map