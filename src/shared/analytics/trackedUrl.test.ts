import { describe, expect, test } from "vitest"
import { sanitizeTrackedHref } from "./trackedUrl"

describe("sanitizeTrackedHref", () => {
  test("redacts reset and invite tokens and email addresses", () => {
    expect(sanitizeTrackedHref("/auth/reset-password?token=AbC123")).toBe(
      "/auth/reset-password?token=[redacted]",
    )
    expect(sanitizeTrackedHref("/auth/signup?inviteToken=xyz&step=2")).toBe(
      "/auth/signup?inviteToken=[redacted]&step=2",
    )
    expect(sanitizeTrackedHref("/auth/forgot-password?email=jane%40example.org#top")).toBe(
      "/auth/forgot-password?email=[redacted]#top",
    )
  })

  test("still masks the share token and leaves other URLs alone", () => {
    expect(sanitizeTrackedHref("/share/AbC_123?x=1")).toBe("/share/[token]?x=1")
    expect(sanitizeTrackedHref("/rs23/uploads?filter=1")).toBe("/rs23/uploads?filter=1")
  })
})
