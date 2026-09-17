import { describe, expect, it } from "vitest"
import { internalFromPath } from "@/src/shared/routing/fromBackLinkSearch"
describe("internalFromPath", () => {
  it("keeps an in-app path with its search", () => {
    expect(internalFromPath("/dashboard/assignments?status=PENDING")).toBe(
      "/dashboard/assignments?status=PENDING",
    )
  })
  it("reduces an absolute url to its path", () => {
    expect(internalFromPath("https://evil.example/dashboard?a=1")).toBe("/dashboard?a=1")
  })
  it("refuses a protocol-relative host", () => {
    expect(internalFromPath("//evil.example/x")).toBeUndefined()
  })
  it("returns nothing for empty or non-string input", () => {
    expect(internalFromPath("")).toBeUndefined()
    expect(internalFromPath(undefined)).toBeUndefined()
  })
})
