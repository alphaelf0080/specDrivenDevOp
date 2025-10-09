import type { SlotSpec } from '../engine/types';
import { type Metrics } from './metrics';
export type SimulationResult = Metrics & {
    totalWin: number;
    spins: number;
};
export declare function simulate(spec: SlotSpec, opts: {
    seed: string;
    spins: number;
}): SimulationResult;
