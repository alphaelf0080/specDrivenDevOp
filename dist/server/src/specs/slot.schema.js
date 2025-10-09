import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
export const SymbolDef = z.object({
    id: z.string().min(1),
    type: z.enum(['regular', 'wild', 'scatter']).default('regular'),
    weight: z.number().positive().default(1),
});
export const PayTableEntry = z.object({
    symbol: z.string(),
    ofAKind: z.number().int().min(2).max(5),
    payout: z.number().nonnegative(), // multiplier over bet per line
});
export const Payline = z.object({
    id: z.string(),
    pattern: z.array(z.number().int().nonnegative()), // row indices per reel
});
export const BetConfig = z.object({
    currency: z.string().default('credits'),
    betPerLine: z.number().positive().default(1),
    lines: z.number().int().positive().default(10),
});
export const Feature = z.object({
    name: z.string(),
    type: z.enum(['none', 'freespin']).default('none'),
    // minimal feature stub to keep engine simple
});
export const SlotSpecSchema = z.object({
    meta: z.object({
        name: z.string(),
        version: z.string().default('1.0.0'),
    }),
    reels: z.object({
        columns: z.number().int().min(3).max(7),
        rows: z.number().int().min(3).max(6),
        strips: z.array(z.array(z.string())), // strips per reel
    }),
    symbols: z.array(SymbolDef),
    paytable: z.array(PayTableEntry),
    paylines: z.array(Payline),
    bet: BetConfig,
    jackpots: z
        .array(z.object({
        id: z.string(),
        type: z.enum(['fixed', 'progressive']).default('fixed'),
        amount: z.number().nonnegative().default(0),
    }))
        .default([]),
    features: z.array(Feature).default([]),
    targetRTP: z.number().min(0).max(1).default(0.95),
});
export function toJsonSchema() {
    return zodToJsonSchema(SlotSpecSchema, 'SlotSpec');
}
//# sourceMappingURL=slot.schema.js.map