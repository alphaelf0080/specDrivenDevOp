import type { SlotSpec } from '../engine/types';
export type OptimizeOptions = {
    seed: string;
    spins: number;
    iterations: number;
    targetRTP: number;
    targetVol?: number;
    lambda?: number;
};
export type OptimizeResult = {
    bestSpec: SlotSpec;
    rtp: number;
    volatility: number;
    objective: number;
};
export declare function optimize(spec: SlotSpec, opts: OptimizeOptions): OptimizeResult;
