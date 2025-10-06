import type { SlotSpec } from '../specs/slot.schema';

export type { SlotSpec };

export type Grid = string[][]; // rows x columns symbols

export interface SpinResult {
  grid: Grid;
  totalWin: number; // credits (bet-sized units)
  lineWins: Array<{ lineId: string; ofAKind: number; symbol: string; payout: number }>;
}
