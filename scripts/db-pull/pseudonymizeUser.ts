import { createHash } from "node:crypto"
import { fakerDE as faker } from "@faker-js/faker"

/** True for a FixMyCity address (case-insensitive) - these are kept as-is by the scrub. */
export function isFixMyCityEmail(email: string) {
  return email.toLowerCase().endsWith("@fixmycity.de")
}

function seedNumberFromString(value: string) {
  const digest = createHash("sha256").update(value).digest()
  return digest.readUInt32BE(0)
}

// Deterministic, non-reversible suffix derived from `value` so the generated local part
// never contains fragments of the real id/email it was seeded from.
function hashSuffix(value: string, length = 8) {
  return createHash("sha256").update(value).digest("hex").slice(0, length)
}

// Unicode combining diacritical marks (U+0300-U+036F), built from char codes so no literal
// combining characters need to live in this source file.
const COMBINING_MARK_RANGE_START = 0x0300
const COMBINING_MARK_RANGE_END = 0x036f
const COMBINING_DIACRITICS_REGEX = new RegExp(
  `[${String.fromCharCode(COMBINING_MARK_RANGE_START)}-${String.fromCharCode(COMBINING_MARK_RANGE_END)}]`,
  "g",
)

function slugPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24)
}

function buildInvalidEmail(seedKey: string, firstName: string, lastName: string) {
  const local = [
    slugPart(firstName) || "user",
    slugPart(lastName) || "anon",
    hashSuffix(seedKey),
  ].join(".")
  return `${local}@example.invalid`
}

/** Deterministic Faker pseudonym for a restored non-FixMyCity user, keyed by their (stable) id. */
export function buildPseudonymForUser(userId: number | string) {
  const id = String(userId)
  faker.seed(seedNumberFromString(id))
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    firstName,
    lastName,
    email: buildInvalidEmail(id, firstName, lastName),
  }
}

/**
 * Deterministic pseudonym email for an Invite whose email doesn't match any User row.
 * Keyed by the lowercased original email so re-running the scrub is stable.
 */
export function buildPseudonymEmail(originalEmail: string) {
  const key = originalEmail.toLowerCase()
  faker.seed(seedNumberFromString(key))
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return buildInvalidEmail(key, firstName, lastName)
}
