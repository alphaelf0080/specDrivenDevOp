import type { Grid } from './types';
export declare function getLineSymbols(grid: Grid, pattern: number[]): string[];
export declare function countLeftToRight(lineSymbols: string[], isWild: (s: string) => boolean): {
    symbol: string | null;
    count: number;
};
