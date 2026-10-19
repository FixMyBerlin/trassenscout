import { describe, expect, test } from "vitest"
import { getTagFilterOptions, getTagFilterSelection, matchesTagFilter } from "./tagFilterOptions"

const entries = [
  { tags: [{ title: "Zebrastreifen" }] },
  { tags: [{ title: "Ampel" }, { title: "zebrastreifen" }] },
  { tags: [] },
]

describe("getTagFilterOptions", () => {
  test("lists each title once regardless of case, sorted", () => {
    expect(getTagFilterOptions(entries)).toEqual(["Ampel", "Zebrastreifen"])
  })
})

describe("getTagFilterSelection", () => {
  test("selects the listed spelling of a tag regardless of case", () => {
    expect(getTagFilterSelection(["Ampel", "Test"], "test")).toEqual({
      selected: "Test",
      titles: ["Ampel", "Test"],
    })
  })

  test("keeps a selected tag without entries listed", () => {
    expect(getTagFilterSelection(["Ampel"], "Brücke")).toEqual({
      selected: "Brücke",
      titles: ["Ampel", "Brücke"],
    })
  })

  test("selects nothing without a value", () => {
    expect(getTagFilterSelection(["Ampel"], undefined)).toEqual({
      selected: undefined,
      titles: ["Ampel"],
    })
  })
})

describe("matchesTagFilter", () => {
  test("keeps every entry without a tag and matches titles ignoring case", () => {
    expect(entries.filter((entry) => matchesTagFilter(entry, undefined))).toHaveLength(3)
    expect(entries.filter((entry) => matchesTagFilter(entry, "ZEBRASTREIFEN"))).toEqual([
      entries[0],
      entries[1],
    ])
  })
})
