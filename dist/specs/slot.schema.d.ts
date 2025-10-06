import { z } from 'zod';
export declare const SymbolDef: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["regular", "wild", "scatter"]>>;
    weight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "regular" | "wild" | "scatter";
    weight: number;
}, {
    id: string;
    type?: "regular" | "wild" | "scatter" | undefined;
    weight?: number | undefined;
}>;
export declare const PayTableEntry: z.ZodObject<{
    symbol: z.ZodString;
    ofAKind: z.ZodNumber;
    payout: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    ofAKind: number;
    payout: number;
}, {
    symbol: string;
    ofAKind: number;
    payout: number;
}>;
export declare const Payline: z.ZodObject<{
    id: z.ZodString;
    pattern: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    pattern: number[];
}, {
    id: string;
    pattern: number[];
}>;
export declare const BetConfig: z.ZodObject<{
    currency: z.ZodDefault<z.ZodString>;
    betPerLine: z.ZodDefault<z.ZodNumber>;
    lines: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    betPerLine: number;
    lines: number;
}, {
    currency?: string | undefined;
    betPerLine?: number | undefined;
    lines?: number | undefined;
}>;
export declare const Feature: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["none", "freespin"]>>;
}, "strip", z.ZodTypeAny, {
    type: "none" | "freespin";
    name: string;
}, {
    name: string;
    type?: "none" | "freespin" | undefined;
}>;
export declare const SlotSpecSchema: z.ZodObject<{
    meta: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
    }, {
        name: string;
        version?: string | undefined;
    }>;
    reels: z.ZodObject<{
        columns: z.ZodNumber;
        rows: z.ZodNumber;
        strips: z.ZodArray<z.ZodArray<z.ZodString, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        columns: number;
        rows: number;
        strips: string[][];
    }, {
        columns: number;
        rows: number;
        strips: string[][];
    }>;
    symbols: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["regular", "wild", "scatter"]>>;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "regular" | "wild" | "scatter";
        weight: number;
    }, {
        id: string;
        type?: "regular" | "wild" | "scatter" | undefined;
        weight?: number | undefined;
    }>, "many">;
    paytable: z.ZodArray<z.ZodObject<{
        symbol: z.ZodString;
        ofAKind: z.ZodNumber;
        payout: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        symbol: string;
        ofAKind: number;
        payout: number;
    }, {
        symbol: string;
        ofAKind: number;
        payout: number;
    }>, "many">;
    paylines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        pattern: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        pattern: number[];
    }, {
        id: string;
        pattern: number[];
    }>, "many">;
    bet: z.ZodObject<{
        currency: z.ZodDefault<z.ZodString>;
        betPerLine: z.ZodDefault<z.ZodNumber>;
        lines: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        betPerLine: number;
        lines: number;
    }, {
        currency?: string | undefined;
        betPerLine?: number | undefined;
        lines?: number | undefined;
    }>;
    jackpots: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["fixed", "progressive"]>>;
        amount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "fixed" | "progressive";
        amount: number;
    }, {
        id: string;
        type?: "fixed" | "progressive" | undefined;
        amount?: number | undefined;
    }>, "many">>;
    features: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["none", "freespin"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "none" | "freespin";
        name: string;
    }, {
        name: string;
        type?: "none" | "freespin" | undefined;
    }>, "many">>;
    targetRTP: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    meta: {
        name: string;
        version: string;
    };
    reels: {
        columns: number;
        rows: number;
        strips: string[][];
    };
    symbols: {
        id: string;
        type: "regular" | "wild" | "scatter";
        weight: number;
    }[];
    paytable: {
        symbol: string;
        ofAKind: number;
        payout: number;
    }[];
    paylines: {
        id: string;
        pattern: number[];
    }[];
    bet: {
        currency: string;
        betPerLine: number;
        lines: number;
    };
    jackpots: {
        id: string;
        type: "fixed" | "progressive";
        amount: number;
    }[];
    features: {
        type: "none" | "freespin";
        name: string;
    }[];
    targetRTP: number;
}, {
    meta: {
        name: string;
        version?: string | undefined;
    };
    reels: {
        columns: number;
        rows: number;
        strips: string[][];
    };
    symbols: {
        id: string;
        type?: "regular" | "wild" | "scatter" | undefined;
        weight?: number | undefined;
    }[];
    paytable: {
        symbol: string;
        ofAKind: number;
        payout: number;
    }[];
    paylines: {
        id: string;
        pattern: number[];
    }[];
    bet: {
        currency?: string | undefined;
        betPerLine?: number | undefined;
        lines?: number | undefined;
    };
    jackpots?: {
        id: string;
        type?: "fixed" | "progressive" | undefined;
        amount?: number | undefined;
    }[] | undefined;
    features?: {
        name: string;
        type?: "none" | "freespin" | undefined;
    }[] | undefined;
    targetRTP?: number | undefined;
}>;
export type SlotSpec = z.infer<typeof SlotSpecSchema>;
export declare function toJsonSchema(): import("zod-to-json-schema").JsonSchema7Type & {
    $schema?: string | undefined;
    definitions?: {
        [key: string]: import("zod-to-json-schema").JsonSchema7Type;
    } | undefined;
};
