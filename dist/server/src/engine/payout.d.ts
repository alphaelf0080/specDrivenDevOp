import type { SlotSpec } from './types';
export declare function isWild(spec: SlotSpec, id: string): boolean;
export declare function isScatter(spec: SlotSpec, id: string): boolean;
export declare function evaluateLines(spec: SlotSpec, grid: string[][]): {
    lineId: string;
    ofAKind: number;
    symbol: string;
    payout: number;
}[];
export declare function evaluateScatters(spec: SlotSpec, grid: string[][]): number;
