import { type SlotSpec } from './slot.schema';
export type ValidationResult = {
    ok: boolean;
    errors?: string[];
    data?: SlotSpec;
};
export declare function validateSpec(obj: unknown): ValidationResult;
