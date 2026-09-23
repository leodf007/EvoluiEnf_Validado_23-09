/**
 * Shared utility functions for module-specific normalizers.
 * Provides pure sanitization and structural cleaning helpers without
 * imposing generic clinical interpretations.
 */

export function cleanEmptyString(val: string | null | undefined): string | undefined {
  if (val === undefined || val === null) return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function cleanOptionalArray<T>(arr: T[] | null | undefined): T[] | undefined {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return undefined;
  return arr;
}

export function cleanConditionalObject<T extends object>(condition: boolean, obj: T): T | undefined {
  if (!condition) return undefined;
  return obj;
}

export function normalizeNumericInput(val: string | number | null | undefined): string | undefined {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}
