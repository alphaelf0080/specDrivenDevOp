import type { SlotSpec } from './types';
import type { RNG } from './rng';
export declare function spinGrid(spec: SlotSpec, rng: RNG): string[][];
export declare function evaluateSpin(spec: SlotSpec, grid: string[][]): {
    grid: string[][];
    lineWins: {
        lineId: string;
        ofAKind: number;
        symbol: string;
        payout: number;
    }[];
    totalWin: number;
};
