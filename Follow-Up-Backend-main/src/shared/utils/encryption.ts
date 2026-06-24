import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not set in environment");

  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return buf;
}

/**
 * Encrypts a plain text string.
 * Returns a colon-separated string: iv:authTag:ciphertext (all hex encoded)
 */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a string produced by encrypt().
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const parts = encryptedText.split(":");

  if (parts.length !== 3) throw new Error("Invalid encrypted text format");

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
}

/**
 * Returns a masked version for display: shows last 4 chars, rest as *.
 * e.g. "sk-abcdef1234" => "********1234"
 */
export function maskSecret(plainText: string): string {
  if (plainText.length <= 4) return "****";
  return plainText.slice(0, 4) + "*".repeat(plainText.length - 4);
}
