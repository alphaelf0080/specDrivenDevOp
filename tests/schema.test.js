'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const basic_slot_json_1 = __importDefault(require('../src/specs/examples/basic-slot.json'));
const validate_1 = require('../src/specs/validate');
test('example spec validates', () => {
  const res = (0, validate_1.validateSpec)(basic_slot_json_1.default);
  expect(res.ok).toBe(true);
});
//# sourceMappingURL=schema.test.js.map
