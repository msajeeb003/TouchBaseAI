/**
 * Strips common phone formatting: whitespace, hyphens, parentheses.
 * Keeps +, digits, and other characters (extensions, etc.).
 */
export function normalizePhoneInput(value: string): string {
  return value.replace(/[\s\-()]/g, "").trim();
}
