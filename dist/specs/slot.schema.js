"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotSpecSchema = exports.Feature = exports.BetConfig = exports.Payline = exports.PayTableEntry = exports.SymbolDef = void 0;
exports.toJsonSchema = toJsonSchema;
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
exports.SymbolDef = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.enum(['regular', 'wild', 'scatter']).default('regular'),
    weight: zod_1.z.number().positive().default(1),
});
exports.PayTableEntry = zod_1.z.object({
    symbol: zod_1.z.string(),
    ofAKind: zod_1.z.number().int().min(2).max(5),
    payout: zod_1.z.number().nonnegative(), // multiplier over bet per line
});
exports.Payline = zod_1.z.object({
    id: zod_1.z.string(),
    pattern: zod_1.z.array(zod_1.z.number().int().nonnegative()), // row indices per reel
});
exports.BetConfig = zod_1.z.object({
    currency: zod_1.z.string().default('credits'),
    betPerLine: zod_1.z.number().positive().default(1),
    lines: zod_1.z.number().int().positive().default(10),
});
exports.Feature = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['none', 'freespin']).default('none'),
    // minimal feature stub to keep engine simple
});
exports.SlotSpecSchema = zod_1.z.object({
    meta: zod_1.z.object({
        name: zod_1.z.string(),
        version: zod_1.z.string().default('1.0.0'),
    }),
    reels: zod_1.z.object({
        columns: zod_1.z.number().int().min(3).max(7),
        rows: zod_1.z.number().int().min(3).max(6),
        strips: zod_1.z.array(zod_1.z.array(zod_1.z.string())), // strips per reel
    }),
    symbols: zod_1.z.array(exports.SymbolDef),
    paytable: zod_1.z.array(exports.PayTableEntry),
    paylines: zod_1.z.array(exports.Payline),
    bet: exports.BetConfig,
    jackpots: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(['fixed', 'progressive']).default('fixed'),
        amount: zod_1.z.number().nonnegative().default(0),
    }))
        .default([]),
    features: zod_1.z.array(exports.Feature).default([]),
    targetRTP: zod_1.z.number().min(0).max(1).default(0.95),
});
function toJsonSchema() {
    return (0, zod_to_json_schema_1.zodToJsonSchema)(exports.SlotSpecSchema, 'SlotSpec');
}
//# sourceMappingURL=slot.schema.js.map