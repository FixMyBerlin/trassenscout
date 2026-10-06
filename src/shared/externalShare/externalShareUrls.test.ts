import { describe, expect, test } from "vitest"
import { maskExternalShareToken } from "./externalShareUrls"

describe("maskExternalShareToken", () => {
  test("replaces the token so analytics never store the credential", () => {
    expect(maskExternalShareToken("/share/AbC_123-xyz")).toBe("/share/[token]")
  })

  test("keeps query and hash", () => {
    expect(maskExternalShareToken("/share/AbC_123?x=1#top")).toBe("/share/[token]?x=1#top")
  })

  test("leaves other paths untouched, including the internal management page", () => {
    expect(maskExternalShareToken("/rs23/uploads?filter=1")).toBe("/rs23/uploads?filter=1")
    expect(maskExternalShareToken("/rs8/external-share")).toBe("/rs8/external-share")
  })
})
