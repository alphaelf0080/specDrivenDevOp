import type { SlotSpec } from '../specs/slot.schema';
export type { SlotSpec };
export type Grid = string[][];
export interface SpinResult {
    grid: Grid;
    totalWin: number;
    lineWins: Array<{
        lineId: string;
        ofAKind: number;
        symbol: string;
        payout: number;
    }>;
}
