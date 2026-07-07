/**
 * Normalize a phone number to E.164 for Twilio / Retell.
 *
 * Strips spaces, dashes, parentheses and dots and keeps (or adds) a leading "+".
 * Examples:
 *   "1 647-290-6494"     -> "+16472906494"
 *   "+44 7739 570000"    -> "+447739570000"
 *   "00971586880000"     -> "+971586880000"
 *
 * Returns null when there are no digits to work with.
 */
export const toE164 = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const hadPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  // "00" is the international dialling prefix — treat it like a leading "+".
  if (!hadPlus && digits.startsWith("00")) digits = digits.slice(2);
  return "+" + digits;
};
