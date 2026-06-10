import { describe, expect, it } from "vitest"
import {
  buildCacheKey,
  buildFingerprintLines,
  computeEnvFingerprint,
  hashFingerprintLines,
  mergeChangeSignals,
  resolveEnvChanges,
  type FingerprintScopesConfig,
} from "./env-fingerprint.ts"

const config: FingerprintScopesConfig = {
  scopes: {
    app: ["VITE_APP_ENV", "VITE_APP_ORIGIN"],
    "imap-listener": ["VITE_APP_ENV", "IMAP_HOST"],
  },
}

describe("buildFingerprintLines", () => {
  it("returns null for unknown scopes", () => {
    expect(buildFingerprintLines("unknown", config, {})).toBeNull()
  })

  it("builds stable name=value lines with empty defaults", () => {
    expect(
      buildFingerprintLines("app", config, {
        VITE_APP_ENV: "staging",
        VITE_APP_ORIGIN: "https://example.test",
      }),
    ).toEqual(["VITE_APP_ENV=staging", "VITE_APP_ORIGIN=https://example.test"])
  })
})

describe("hashFingerprintLines", () => {
  it("produces deterministic sha256 hashes", () => {
    const lines = ["VITE_APP_ENV=staging", "VITE_APP_ORIGIN=https://example.test"]
    expect(hashFingerprintLines(lines)).toBe(hashFingerprintLines(lines))
    expect(hashFingerprintLines(lines)).toHaveLength(64)
  })
})

describe("computeEnvFingerprint", () => {
  it("returns hash and cache key for known scopes", () => {
    const result = computeEnvFingerprint({
      scope: "imap-listener",
      config,
      env: { VITE_APP_ENV: "production", IMAP_HOST: "imap.example.test" },
      refName: "main",
      environment: "production",
    })

    expect(result).not.toBeNull()
    expect(result?.cacheKey).toBe(
      buildCacheKey({
        refName: "main",
        environment: "production",
        scope: "imap-listener",
        hash: result!.hash,
      }),
    )
  })
})

describe("resolveEnvChanges", () => {
  it("returns false when hash is empty", () => {
    expect(resolveEnvChanges("", "false")).toBe(false)
  })

  it("returns false when cache hit", () => {
    expect(resolveEnvChanges("abc123", "true")).toBe(false)
  })

  it("returns true when hash exists and cache missed", () => {
    expect(resolveEnvChanges("abc123", "false")).toBe(true)
  })
})

describe("mergeChangeSignals", () => {
  it("returns true when either signal reports changes", () => {
    expect(mergeChangeSignals("false", "true")).toBe(true)
    expect(mergeChangeSignals("true", "false")).toBe(true)
  })

  it("returns false only when both signals are false", () => {
    expect(mergeChangeSignals("false", "false")).toBe(false)
  })
})
