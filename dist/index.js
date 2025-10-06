"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSpin = exports.spinGrid = exports.SeededRNG = exports.optimize = exports.simulate = exports.validateSpec = void 0;
exports.createEngine = createEngine;
var validate_1 = require("./specs/validate");
Object.defineProperty(exports, "validateSpec", { enumerable: true, get: function () { return validate_1.validateSpec; } });
var simulator_1 = require("./sim/simulator");
Object.defineProperty(exports, "simulate", { enumerable: true, get: function () { return simulator_1.simulate; } });
var optimizer_1 = require("./agent/optimizer");
Object.defineProperty(exports, "optimize", { enumerable: true, get: function () { return optimizer_1.optimize; } });
var rng_1 = require("./engine/rng");
Object.defineProperty(exports, "SeededRNG", { enumerable: true, get: function () { return rng_1.SeededRNG; } });
var slotEngine_1 = require("./engine/slotEngine");
Object.defineProperty(exports, "spinGrid", { enumerable: true, get: function () { return slotEngine_1.spinGrid; } });
Object.defineProperty(exports, "evaluateSpin", { enumerable: true, get: function () { return slotEngine_1.evaluateSpin; } });
const rng_2 = require("./engine/rng");
const slotEngine_2 = require("./engine/slotEngine");
function createEngine(spec, seed) {
    const rng = new rng_2.SeededRNG(seed);
    return {
        spin() {
            const grid = (0, slotEngine_2.spinGrid)(spec, rng);
            return (0, slotEngine_2.evaluateSpin)(spec, grid);
        },
    };
}
//# sourceMappingURL=index.js.map