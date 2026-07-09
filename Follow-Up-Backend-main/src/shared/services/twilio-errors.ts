/**
 * Actionable, human-readable hints for common Twilio WhatsApp/SMS error codes.
 * Appended to a step's send log so the failure explains how to fix it.
 * Returns "" for codes we have no specific guidance for.
 */
export const twilioErrorHint = (code: number): string => {
  switch (code) {
    case 63015:
      // WhatsApp Sandbox: only messages numbers that joined the sandbox.
      return " — This is Twilio's WhatsApp Sandbox, which only messages numbers that have joined it. To reach any lead, set up a production WhatsApp sender in Twilio and enter that number in Settings; for testing, have this recipient send your sandbox \"join <keyword>\" first.";
    case 63016:
      return " — WhatsApp only allows free-form messages within 24h of the contact's last reply. Outside that window you must use an approved WhatsApp message template.";
    case 63007:
    case 63013:
      return " — Your WhatsApp sender configuration looks wrong. Check the Twilio WhatsApp number and channel in Settings.";
    case 21211:
      return " — The recipient number isn't valid E.164. Fix the lead's phone number (e.g. +14155551234).";
    case 21612:
    case 21408:
      return " — Twilio can't send to this destination country/number. Enable it under Messaging → Geo Permissions in the Twilio console, and make sure your sender number supports it.";
    case 21610:
      return " — This recipient has opted out (replied STOP). They must text START to opt back in before you can message them.";
    default:
      return "";
  }
};
