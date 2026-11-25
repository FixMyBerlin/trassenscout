import { describe, expect, test } from "vitest"
import { compareSlugs } from "@/src/components/core/components/text/titles"
import { compareSortValues, sortRows, type SortValue } from "./sortRows"
import type { SortDirection } from "./tableSort"

const sorted = (values: SortValue[], direction: SortDirection) =>
  [...values].sort((a, b) => compareSortValues(a, b, direction))

describe("compareSortValues", () => {
  test("text ignores case", () => {
    expect(sorted(["b", "C", "a"], "asc")).toEqual(["a", "b", "C"])
  })

  test("text sorts umlauts with their base letter and numbers naturally", () => {
    expect(sorted(["zebra", "pa10", "Birne", "pa2", "Äpfel"], "asc")).toEqual([
      "Äpfel",
      "Birne",
      "pa2",
      "pa10",
      "zebra",
    ])
  })

  test("compareSlugs uses the same collator", () => {
    expect(["pa10", "pa2"].sort(compareSlugs)).toEqual(["pa2", "pa10"])
  })

  test("numbers and dates sort by value", () => {
    expect(sorted([10, 2, 0], "asc")).toEqual([0, 2, 10])
    const jan = new Date("2026-01-01")
    const may = new Date("2026-05-01")
    expect(sorted([may, jan], "asc")).toEqual([jan, may])
    expect(sorted([jan, may], "desc")).toEqual([may, jan])
  })

  test.each(["asc", "desc"] as const)("empty values come last when sorting %s", (direction) => {
    // Through sortRows: Array.sort never passes bare `undefined` elements to a comparator
    const rows = [null, "b", "", undefined, "  ", "a"].map((value) => ({ value }))
    const result = sortRows(rows, { value: (row) => row.value }, { column: "value", direction })
    expect(result.slice(0, 2).map((row) => row.value)).toEqual(
      direction === "asc" ? ["a", "b"] : ["b", "a"],
    )
  })

  test("leading spaces don't move text to the front", () => {
    expect(sorted([" Zebra", "Apfel", "Birne"], "asc")).toEqual(["Apfel", "Birne", " Zebra"])
  })

  test("NaN and invalid dates count as empty", () => {
    expect(sorted([Number.NaN, 1], "asc")).toEqual([1, Number.NaN])
    const date = new Date("2026-01-01")
    const invalid = new Date("not a date")
    expect(sorted([invalid, date], "desc")).toEqual([date, invalid])
  })
})

describe("sortRows", () => {
  type Row = { slug: string; status: string }
  const sortValues = {
    slug: (row: Row) => row.slug,
    status: (row: Row) => row.status,
  }

  test("ties fall back to the default sort, then keep the input order", () => {
    const rows: Row[] = [
      { slug: "pa3", status: "Planung" },
      { slug: "pa1", status: "Bau" },
      { slug: "pa2", status: "Planung" },
    ]
    const result = sortRows(
      rows,
      sortValues,
      { column: "status", direction: "asc" },
      { column: "slug", direction: "asc" },
    )
    expect(result.map((row) => row.slug)).toEqual(["pa1", "pa2", "pa3"])
  })

  test("without a sort the rows keep their order and the input stays untouched", () => {
    const rows: Row[] = [
      { slug: "b", status: "" },
      { slug: "a", status: "" },
    ]
    const result = sortRows(rows, sortValues, undefined)
    expect(result.map((row) => row.slug)).toEqual(["b", "a"])
    expect(result).not.toBe(rows)
  })
})
