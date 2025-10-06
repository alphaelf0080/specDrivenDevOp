import example from '../src/specs/examples/basic-slot.json';
import { validateSpec } from '../src/specs/validate';

test('example spec validates', () => {
  const res = validateSpec(example);
  expect(res.ok).toBe(true);
});
