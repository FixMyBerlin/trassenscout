import { describe, expect, it } from "vitest"
import { routerSearch } from "./routerSearch"

const roundTrip = (search: Record<string, unknown>) =>
  routerSearch.parse(routerSearch.stringify(search))

describe("routerSearch", () => {
  it.each([
    "1.10",
    "1.0",
    "10.10",
    "1e3",
    "2024",
    "12345678901234567890",
    "true",
    "null",
    "[1]",
    '"abc"',
  ])("keeps the text %s unchanged", (text) => {
    expect(roundTrip({ searchterm: text })).toEqual({ searchterm: text })
  })

  it("keeps numbers, booleans and objects as they are", () => {
    const search = { page: 2, mcpDraft: true, filter: { searchterm: "2024" } }

    expect(roundTrip(search)).toEqual(search)
  })

  it("quotes only text that would otherwise turn into another value", () => {
    expect(routerSearch.stringify({ searchterm: "1.10" })).toBe('?searchterm="1.10"')
    expect(routerSearch.stringify({ searchterm: "radweg", view: "list" })).toBe(
      "?searchterm=radweg&view=list",
    )
  })
})
