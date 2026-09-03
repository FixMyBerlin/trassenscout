import { describe, expect, test } from "vitest"
import {
  isSubsectionMcpDraftSearch,
  subsectionEditSearchSchema,
  subsectionNewSearchSchema,
} from "@/src/shared/subsections/searchSchemas"

describe("subsectionEditSearchSchema", () => {
  test("accepts boolean true from JSON search (?mcpDraft=true)", () => {
    expect(subsectionEditSearchSchema.parse({ mcpDraft: true })).toEqual({ mcpDraft: true })
    expect(isSubsectionMcpDraftSearch(true)).toBe(true)
  })

  test("accepts string true from quoted JSON search", () => {
    expect(subsectionEditSearchSchema.parse({ mcpDraft: "true" })).toEqual({ mcpDraft: "true" })
    expect(isSubsectionMcpDraftSearch("true")).toBe(true)
  })

  test("omitted or invalid values are not treated as apply-draft", () => {
    expect(subsectionEditSearchSchema.parse({})).toEqual({})
    expect(isSubsectionMcpDraftSearch(undefined)).toBe(false)
    expect(subsectionEditSearchSchema.safeParse({ mcpDraft: false }).success).toBe(false)
  })
})

describe("subsectionNewSearchSchema", () => {
  test("accepts mcpDraft and slug", () => {
    expect(subsectionNewSearchSchema.parse({ mcpDraft: true, slug: "pa8" })).toEqual({
      mcpDraft: true,
      slug: "pa8",
    })
  })
})
