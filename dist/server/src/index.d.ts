export { validateSpec } from './specs/validate';
export type { SlotSpec } from './specs/slot.schema';
export { simulate } from './sim/simulator';
export { optimize } from './agent/optimizer';
export { SeededRNG } from './engine/rng';
export { spinGrid, evaluateSpin } from './engine/slotEngine';
export declare function createEngine(spec: import('./specs/slot.schema').SlotSpec, seed: string): {
    spin(): {
        grid: string[][];
        lineWins: {
            lineId: string;
            ofAKind: number;
            symbol: string;
            payout: number;
        }[];
        totalWin: number;
    };
};
