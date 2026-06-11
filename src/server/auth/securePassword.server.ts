/**
 * Legacy Blitz.js password hashing (Argon2id via secure-password).
 * Kept for Better Auth migration so existing hashes keep working; see
 * https://github.com/FixMyBerlin/private-issues/issues/3385
 */
import SecurePasswordLib from "secure-password"

const securePassword = new SecurePasswordLib()

function toPasswordBuffer(password: string) {
  return Buffer.from(password)
}

function toHashBuffer(hash: string) {
  return Buffer.from(hash, "base64")
}

export const SecurePassword = {
  VALID: SecurePasswordLib.VALID,
  VALID_NEEDS_REHASH: SecurePasswordLib.VALID_NEEDS_REHASH,
  INVALID: SecurePasswordLib.INVALID,
  async hash(password: string) {
    const hashBuf = await securePassword.hash(toPasswordBuffer(password))
    return hashBuf.toString("base64")
  },
  verify(hash: string, password: string) {
    return securePassword.verify(toPasswordBuffer(password), toHashBuffer(hash))
  },
}
