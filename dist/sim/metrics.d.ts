export type Metrics = {
    rtp: number;
    hitRate: number;
    volatility: number;
};
export declare function computeMetrics(wins: number[], betPerSpin: number): Metrics;
