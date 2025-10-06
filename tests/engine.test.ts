import { SeededRNG } from '../src/engine/rng';
import { spinGrid, evaluateSpin } from '../src/engine/slotEngine';
import example from '../src/specs/examples/basic-slot.json';
import { SlotSpecSchema } from '../src/specs/slot.schema';

const spec = SlotSpecSchema.parse(example);

test('deterministic spin with same seed', () => {
  const rng1 = new SeededRNG('seed');
  const rng2 = new SeededRNG('seed');
  const g1 = spinGrid(spec, rng1);
  const g2 = spinGrid(spec, rng2);
  expect(g1).toEqual(g2);
});

test('quick simulation under 1s for 5000 spins', () => {
  const rng = new SeededRNG('speed');
  let total = 0;
  const start = Date.now();
  for (let i = 0; i < 5000; i++) {
    const grid = spinGrid(spec, rng);
    const result = evaluateSpin(spec, grid);
    total += result.totalWin;
  }
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(1000);
  expect(typeof total).toBe('number');
});
