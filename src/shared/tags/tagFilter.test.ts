import { describe, expect, test } from "vitest"
import { mergeSearchtermTagFilter, searchtermTagFilterSchema } from "./tagFilter"

describe("mergeSearchtermTagFilter", () => {
  test("merges a patch and keeps the other field", () => {
    expect(mergeSearchtermTagFilter({ searchterm: "plan" }, { tag: "Ampel" })).toEqual({
      searchterm: "plan",
      tag: "Ampel",
    })
  })

  test("drops cleared fields and resets on an undefined patch", () => {
    expect(mergeSearchtermTagFilter({ tag: "Ampel" }, { tag: undefined })).toBeUndefined()
    expect(mergeSearchtermTagFilter({ searchterm: "plan" }, undefined)).toBeUndefined()
  })
})

describe("searchtermTagFilterSchema", () => {
  test("drops an invalid tag but keeps the search", () => {
    expect(searchtermTagFilterSchema.parse({ searchterm: "plan", tag: 4 })).toEqual({
      searchterm: "plan",
      tag: undefined,
    })
  })
})
