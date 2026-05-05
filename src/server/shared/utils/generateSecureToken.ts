import { randomBytes } from "node:crypto"

/** Cryptographically secure random string (default 32 bytes, base64url). */
export function generateSecureToken(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url")
}
