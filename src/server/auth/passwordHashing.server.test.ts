import { describe, expect, test } from "vitest"
import {
  hashPassword,
  isLegacyHashFormat,
  verifyPassword,
} from "@/src/server/auth/passwordHashing.server"

// Generated with the removed `secure-password` library (Argon2id, libsodium
// interactive limits) exactly like the Blitz.js app stored it: base64 of a
// null-padded 128-byte PHC string.
const legacyHash =
  "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDdBbDc3TmVUVmp6VDFCSDVaS0lGMnckTnNwMDJjbGFnMUxYdUVZSllrbDAyQ0ExTTZKUy93RkUrZVF6VE1ndGRtWQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
const legacyPassword = "test-password-1234"

// The hash from `prisma/seeds/users.ts` — a second real-world sample
const seedHash =
  "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJDRMWm82dmVrRk91VnVlZTVwcEpiS3ckOHFZcHhyM2RITm0yTGxTeXdqeEcxSWFsZEJCUWhxNVZxdm53eHoxTk4xTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
const seedPassword = "dev-team@fixmycity.de"

describe("passwordHashing.server", () => {
  describe("legacy secure-password hashes", () => {
    test("verifies the correct password", async () => {
      await expect(verifyPassword(legacyHash, legacyPassword)).resolves.toBe(true)
    })

    test("rejects a wrong password", async () => {
      await expect(verifyPassword(legacyHash, "wrong-password")).resolves.toBe(false)
    })

    test("verifies the seed users hash", async () => {
      await expect(verifyPassword(seedHash, seedPassword)).resolves.toBe(true)
    })
  })

  describe("new hashes", () => {
    test("hash and verify round-trip", async () => {
      const hash = await hashPassword("some-new-password")
      await expect(verifyPassword(hash, "some-new-password")).resolves.toBe(true)
      await expect(verifyPassword(hash, "some-other-password")).resolves.toBe(false)
    })

    test("uses PHC format with the legacy Argon2id parameters", async () => {
      const hash = await hashPassword("some-new-password")
      expect(hash).toMatch(/^\$argon2id\$v=19\$m=65536,t=2,p=1\$/)
    })
  })

  describe("isLegacyHashFormat", () => {
    test("detects legacy base64 hashes", () => {
      expect(isLegacyHashFormat(legacyHash)).toBe(true)
    })

    test("detects new PHC hashes", async () => {
      expect(isLegacyHashFormat(await hashPassword("some-new-password"))).toBe(false)
    })
  })

  describe("malformed hashes", () => {
    test("returns false instead of throwing", async () => {
      await expect(verifyPassword("not-a-hash", "password")).resolves.toBe(false)
      await expect(verifyPassword("", "password")).resolves.toBe(false)
    })
  })
})
