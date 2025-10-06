export interface RNG {
    next(): number;
    int(maxExclusive: number): number;
}
export declare class SeededRNG implements RNG {
    private rng;
    constructor(seed: string);
    next(): number;
    int(maxExclusive: number): number;
}
