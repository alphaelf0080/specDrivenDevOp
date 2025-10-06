"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeededRNG = void 0;
const seedrandom_1 = __importDefault(require("seedrandom"));
class SeededRNG {
    constructor(seed) {
        this.rng = (0, seedrandom_1.default)(seed, { global: false });
    }
    next() {
        return this.rng.quick();
    }
    int(maxExclusive) {
        return Math.floor(this.next() * maxExclusive);
    }
}
exports.SeededRNG = SeededRNG;
//# sourceMappingURL=rng.js.map