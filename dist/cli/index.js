#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const validate_1 = require("../specs/validate");
const slot_schema_1 = require("../specs/slot.schema");
const rng_1 = require("../engine/rng");
const slotEngine_1 = require("../engine/slotEngine");
const simulator_1 = require("../sim/simulator");
const optimizer_1 = require("../agent/optimizer");
const program = new commander_1.Command();
program.name('slot-cli').description('Spec-driven slot engine CLI').version('0.1.0');
function loadSpec(p) {
    const abs = node_path_1.default.resolve(process.cwd(), p);
    const raw = JSON.parse(node_fs_1.default.readFileSync(abs, 'utf-8'));
    const parsed = slot_schema_1.SlotSpecSchema.parse(raw);
    return parsed;
}
program
    .command('validate')
    .requiredOption('-s, --spec <file>', 'Path to slot spec JSON')
    .action((opts) => {
    const raw = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.resolve(opts.spec), 'utf-8'));
    const res = (0, validate_1.validateSpec)(raw);
    if (!res.ok) {
        console.error('Invalid spec:', res.errors);
        process.exitCode = 1;
    }
    else {
        console.log('Spec is valid.');
    }
});
program
    .command('spin')
    .requiredOption('-s, --spec <file>', 'Path to slot spec JSON')
    .option('--seed <seed>', 'RNG seed', 'demo')
    .action((opts) => {
    const spec = loadSpec(opts.spec);
    const rng = new rng_1.SeededRNG(opts.seed ?? 'demo');
    const grid = (0, slotEngine_1.spinGrid)(spec, rng);
    const result = (0, slotEngine_1.evaluateSpin)(spec, grid);
    console.log(JSON.stringify(result, null, 2));
});
program
    .command('simulate')
    .requiredOption('-s, --spec <file>', 'Path to slot spec JSON')
    .option('--seed <seed>', 'RNG seed', 'demo')
    .option('--spins <n>', 'Number of spins', '5000')
    .action((opts) => {
    const spec = loadSpec(opts.spec);
    const res = (0, simulator_1.simulate)(spec, {
        seed: opts.seed ?? 'demo',
        spins: parseInt(opts.spins ?? '5000', 10),
    });
    console.log(JSON.stringify(res, null, 2));
});
program
    .command('optimize')
    .requiredOption('-s, --spec <file>', 'Path to slot spec JSON')
    .option('--seed <seed>', 'RNG seed', 'demo')
    .option('--spins <n>', 'Spins per iteration', '2000')
    .option('--iters <n>', 'Iterations', '20')
    .option('--targetRTP <r>', 'Target RTP (0-1)', '0.95')
    .option('--targetVol <v>', 'Target volatility (optional)')
    .option('--lambda <l>', 'Weight for volatility term', '0.2')
    .action((opts) => {
    const spec = loadSpec(opts.spec);
    const res = (0, optimizer_1.optimize)(spec, {
        seed: opts.seed ?? 'demo',
        spins: parseInt(opts.spins ?? '2000', 10),
        iterations: parseInt(opts.iters ?? '20', 10),
        targetRTP: parseFloat(opts.targetRTP ?? '0.95'),
        targetVol: opts.targetVol != null ? parseFloat(opts.targetVol) : undefined,
        lambda: parseFloat(opts.lambda ?? '0.2'),
    });
    console.log(JSON.stringify(res, null, 2));
});
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map