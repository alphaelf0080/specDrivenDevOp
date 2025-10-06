"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpec = validateSpec;
const slot_schema_1 = require("./slot.schema");
function validateSpec(obj) {
    const parsed = slot_schema_1.SlotSpecSchema.safeParse(obj);
    if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return { ok: false, errors };
    }
    return { ok: true, data: parsed.data };
}
//# sourceMappingURL=validate.js.map