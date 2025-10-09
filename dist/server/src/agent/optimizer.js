import { simulate } from '../sim/simulator';
import { SeededRNG } from '../engine/rng';
function objective(rtp, targetRTP, vol, targetVol, lambda = 0.2) {
    const rtpTerm = Math.abs(rtp - targetRTP);
    const volTerm = targetVol != null ? Math.abs(vol - targetVol) : 0;
    return rtpTerm + lambda * volTerm;
}
function cloneSpec(spec) {
    return JSON.parse(JSON.stringify(spec));
}
function perturb(spec, rng) {
    const next = cloneSpec(spec);
    // Simple perturbation: swap two symbols in a random reel strip
    const reelIndex = rng.int(next.reels.strips.length);
    const strip = next.reels.strips[reelIndex];
    if (strip.length >= 2) {
        const a = rng.int(strip.length);
        let b = rng.int(strip.length);
        if (b === a)
            b = (b + 1) % strip.length;
        const tmp = strip[a];
        strip[a] = strip[b];
        strip[b] = tmp;
    }
    return next;
}
export function optimize(spec, opts) {
    const rng = new SeededRNG(opts.seed);
    const lambda = opts.lambda ?? 0.2;
    const targetRTP = opts.targetRTP;
    const targetVol = opts.targetVol;
    const spins = opts.spins;
    let current = cloneSpec(spec);
    let best = current;
    let bestScore = Infinity;
    let bestRTP = 0;
    let bestVol = 0;
    for (let i = 0; i < opts.iterations; i++) {
        const candidate = perturb(current, rng);
        const sim = simulate(candidate, { seed: `${opts.seed}-${i}`, spins });
        const score = objective(sim.rtp, targetRTP, sim.volatility, targetVol, lambda);
        if (score < bestScore) {
            bestScore = score;
            best = candidate;
            bestRTP = sim.rtp;
            bestVol = sim.volatility;
        }
        // Simulated annealing-like acceptance: occasionally accept worse
        const temp = Math.max(0.01, 1 - i / opts.iterations);
        if (score < bestScore * (1 + temp * 0.5)) {
            current = candidate;
        }
    }
    return { bestSpec: best, rtp: bestRTP, volatility: bestVol, objective: bestScore };
}
//# sourceMappingURL=optimizer.js.map