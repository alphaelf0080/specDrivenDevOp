import { SlotSpecSchema, type SlotSpec } from './slot.schema';
import type { ZodIssue } from 'zod';

export type ValidationResult = {
  ok: boolean;
  errors?: string[];
  data?: SlotSpec;
};

function issueToZhTW(issue: ZodIssue): string {
  const path = issue.path.join('.') || '(根節點)';
  switch (issue.code) {
    case 'invalid_type': {
      const i = issue as Extract<ZodIssue, { code: 'invalid_type' }>;
      return `${path}: 類型不正確，應為 ${i.expected}，實際為 ${i.received}`;
    }
    case 'invalid_literal': {
      const i = issue as Extract<ZodIssue, { code: 'invalid_literal' }>;
      return `${path}: 值必須為 ${JSON.stringify(i.expected)}`;
    }
    case 'unrecognized_keys': {
      const i = issue as Extract<ZodIssue, { code: 'unrecognized_keys' }>;
      const keys = (i.keys ?? []).join(', ');
      return `${path}: 含有未辨識的鍵：${keys}`;
    }
    case 'invalid_union': {
      return `${path}: 不符合允許的多型（union）格式`;
    }
    case 'invalid_union_discriminator': {
      const i = issue as Extract<ZodIssue, { code: 'invalid_union_discriminator' }>;
      const options = (i.options ?? []).join(', ');
      return `${path}: 無效的區分欄位，允許值：${options}`;
    }
    case 'invalid_enum_value': {
      const i = issue as Extract<ZodIssue, { code: 'invalid_enum_value' }>;
      const options = (i.options ?? []).join(', ');
      return `${path}: 無效的列舉值 ${i.received}，允許值：${options}`;
    }
    case 'invalid_string': {
      const i = issue as Extract<ZodIssue, { code: 'invalid_string' }>;
      return `${path}: 字串格式不正確（${i.validation}）`;
    }
    case 'too_small': {
      const i = issue as Extract<ZodIssue, { code: 'too_small' }>;
      const bound = i.inclusive ? '至少' : '大於';
      return `${path}: ${i.type} 長度/數值需 ${bound} ${i.minimum}`;
    }
    case 'too_big': {
      const i = issue as Extract<ZodIssue, { code: 'too_big' }>;
      const bound = i.inclusive ? '至多' : '小於';
      return `${path}: ${i.type} 長度/數值需 ${bound} ${i.maximum}`;
    }
    case 'invalid_date':
      return `${path}: 無效的日期`;
    case 'custom':
      return `${path}: 自訂驗證未通過`;
    default:
      return `${path}: ${issue.message}`;
  }
}

export function validateSpec(obj: unknown): ValidationResult {
  const parsed = SlotSpecSchema.safeParse(obj);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e: ZodIssue) => issueToZhTW(e));
    return { ok: false, errors };
  }
  return { ok: true, data: parsed.data };
}
