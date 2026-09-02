import { describe, expect, test } from "vitest"
import {
  isSubsubsectionMcpDraftSearch,
  subsubsectionEditSearchSchema,
} from "@/src/shared/subsubsections/searchSchemas"

describe("subsubsectionEditSearchSchema", () => {
  test("accepts boolean true from JSON search (?mcpDraft=true)", () => {
    expect(subsubsectionEditSearchSchema.parse({ mcpDraft: true })).toEqual({ mcpDraft: true })
    expect(isSubsubsectionMcpDraftSearch(true)).toBe(true)
  })

  test("accepts string true from quoted JSON search", () => {
    expect(subsubsectionEditSearchSchema.parse({ mcpDraft: "true" })).toEqual({ mcpDraft: "true" })
    expect(isSubsubsectionMcpDraftSearch("true")).toBe(true)
  })

  test("omitted or invalid values are not treated as apply-draft", () => {
    expect(subsubsectionEditSearchSchema.parse({})).toEqual({})
    expect(isSubsubsectionMcpDraftSearch(undefined)).toBe(false)
    expect(subsubsectionEditSearchSchema.safeParse({ mcpDraft: false }).success).toBe(false)
  })
})
