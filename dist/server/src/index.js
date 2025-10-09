export { validateSpec } from './specs/validate';
export { simulate } from './sim/simulator';
export { optimize } from './agent/optimizer';
export { SeededRNG } from './engine/rng';
export { spinGrid, evaluateSpin } from './engine/slotEngine';
import { SeededRNG } from './engine/rng';
import { spinGrid, evaluateSpin } from './engine/slotEngine';
export function createEngine(spec, seed) {
    const rng = new SeededRNG(seed);
    return {
        spin() {
            const grid = spinGrid(spec, rng);
            return evaluateSpin(spec, grid);
        },
    };
}
//# sourceMappingURL=index.js.map