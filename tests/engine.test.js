'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const rng_1 = require('../src/engine/rng');
const slotEngine_1 = require('../src/engine/slotEngine');
const basic_slot_json_1 = __importDefault(require('../src/specs/examples/basic-slot.json'));
const slot_schema_1 = require('../src/specs/slot.schema');
const spec = slot_schema_1.SlotSpecSchema.parse(basic_slot_json_1.default);
test('deterministic spin with same seed', () => {
  const rng1 = new rng_1.SeededRNG('seed');
  const rng2 = new rng_1.SeededRNG('seed');
  const g1 = (0, slotEngine_1.spinGrid)(spec, rng1);
  const g2 = (0, slotEngine_1.spinGrid)(spec, rng2);
  expect(g1).toEqual(g2);
});
test('quick simulation under 1s for 5000 spins', () => {
  const rng = new rng_1.SeededRNG('speed');
  let total = 0;
  const start = Date.now();
  for (let i = 0; i < 5000; i++) {
    const grid = (0, slotEngine_1.spinGrid)(spec, rng);
    const result = (0, slotEngine_1.evaluateSpin)(spec, grid);
    total += result.totalWin;
  }
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(1000);
  expect(typeof total).toBe('number');
});
//# sourceMappingURL=engine.test.js.map
