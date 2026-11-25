import { describe, expect, test } from "vitest"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import { type SubsectionSortRow, subsectionSortValues } from "./subsectionTableSort"

const row = (slug: string, values: Partial<SubsectionSortRow> = {}): SubsectionSortRow => ({
  slug,
  operator: null,
  SubsectionStatus: null,
  subsubsectionCount: 0,
  estimatedCompletionDateString: null,
  ...values,
})

const slugs = (rows: SubsectionSortRow[]) => rows.map((sortedRow) => sortedRow.slug)

describe("subsectionSortValues", () => {
  test.each(["asc", "desc"] as const)(
    "Fertigstellung sorts by month, empty ones last (%s)",
    (direction) => {
      const rows = [
        row("pa1", { estimatedCompletionDateString: "2030-12" }),
        row("pa2", { estimatedCompletionDateString: "" }),
        row("pa3", { estimatedCompletionDateString: "2025-12" }),
        row("pa4"),
        row("pa5", { estimatedCompletionDateString: "2029-07" }),
      ]
      const result = slugs(
        sortRows(rows, subsectionSortValues, { column: "estimatedCompletion", direction }),
      )
      expect(result.slice(0, 3)).toEqual(
        direction === "asc" ? ["pa3", "pa5", "pa1"] : ["pa1", "pa5", "pa3"],
      )
      expect(result.slice(3).sort()).toEqual(["pa2", "pa4"])
    },
  )

  test.each(["asc", "desc"] as const)(
    "Fertigstellung with an impossible month sorts with the empty ones (%s)",
    (direction) => {
      const rows = [
        row("pa1", { estimatedCompletionDateString: "2026-13" }),
        row("pa2", { estimatedCompletionDateString: "2026-12" }),
        row("pa3", { estimatedCompletionDateString: "2027-01" }),
        row("pa4", { estimatedCompletionDateString: "2026-00" }),
      ]
      expect(
        slugs(sortRows(rows, subsectionSortValues, { column: "estimatedCompletion", direction })),
      ).toEqual(direction === "asc" ? ["pa2", "pa3", "pa1", "pa4"] : ["pa3", "pa2", "pa1", "pa4"])
    },
  )

  test("Maßnahmen count sorts as numbers, 0 first ascending", () => {
    const rows = [
      row("pa1", { subsubsectionCount: 10 }),
      row("pa2", { subsubsectionCount: 0 }),
      row("pa3", { subsubsectionCount: 2 }),
    ]
    expect(
      slugs(
        sortRows(rows, subsectionSortValues, { column: "subsubsectionCount", direction: "asc" }),
      ),
    ).toEqual(["pa2", "pa3", "pa1"])
  })

  test.each(["asc", "desc"] as const)(
    "Planungsabschnitte without Baulastträger come last (%s)",
    (direction) => {
      const rows = [
        row("pa1", { operator: { title: "Landkreis" } }),
        row("pa2"),
        row("pa3", { operator: { title: "amt Gransee" } }),
      ]
      expect(
        slugs(sortRows(rows, subsectionSortValues, { column: "operator", direction })),
      ).toEqual(direction === "asc" ? ["pa3", "pa1", "pa2"] : ["pa1", "pa3", "pa2"])
    },
  )
})
