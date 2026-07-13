/**
 * Argon2id password hashing via @node-rs/argon2.
 *
 * Legacy hashes from the Blitz.js stack (`secure-password` / libsodium) are
 * base64-encoded, null-padded PHC strings created with the same Argon2id
 * parameters, so they verify directly after decoding. New hashes are stored
 * as plain PHC strings; `authHooks.server.ts` lazily rewrites legacy hashes
 * on sign-in. See https://github.com/FixMyBerlin/private-issues/issues/3385
 */
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2"

// libsodium "interactive" limits — the parameters all legacy hashes were created with
const argon2Options = { memoryCost: 65536, timeCost: 2, parallelism: 1 }

const phcPrefix = "$argon2"

export function isLegacyHashFormat(hash: string) {
  return !hash.startsWith(phcPrefix)
}

function toPhcString(hash: string) {
  if (!isLegacyHashFormat(hash)) return hash
  const decoded = Buffer.from(hash, "base64").toString("utf8")
  const nullPaddingStart = decoded.indexOf("\0")
  return nullPaddingStart === -1 ? decoded : decoded.slice(0, nullPaddingStart)
}

export function hashPassword(password: string) {
  return argon2Hash(password, argon2Options)
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2Verify(toPhcString(hash), password)
  } catch {
    // Malformed or unrecognized hash — treat as non-matching instead of leaking a 500
    return false
  }
}
