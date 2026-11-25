import { describe, expect, test } from "vitest"
import { type SubsubsectionSortRow, subsubsectionRowComparator } from "./subsubsectionTableSort"

const row = (
  slug: string,
  values: Partial<Omit<SubsubsectionSortRow, "subsection">> & { subsectionSlug?: string } = {},
): SubsubsectionSortRow => ({
  slug,
  subTitle: values.subTitle ?? null,
  updatedAt: values.updatedAt ?? new Date("2026-01-01"),
  project: values.project ?? { slug: "nudafa" },
  subsection: { slug: values.subsectionSlug ?? "pa1" },
})

describe("subsubsectionRowComparator", () => {
  test("grouped rows stay under their Planungsabschnitt, groups in Kürzel order", () => {
    const rows = [
      row("m1", { subsectionSlug: "pa2", updatedAt: new Date("2026-03-01") }),
      row("m2", { subsectionSlug: "pa10", updatedAt: new Date("2026-05-01") }),
      row("m3", { subsectionSlug: "pa2", updatedAt: new Date("2026-06-01") }),
    ]
    const order = [...rows]
      .sort(
        subsubsectionRowComparator({ column: "updatedAt", direction: "desc" }, { grouped: true }),
      )
      .map((sortedRow) => `${sortedRow.subsection.slug}/${sortedRow.slug}`)
    expect(order).toEqual(["pa2/m3", "pa2/m1", "pa10/m2"])
  })

  test.each(["asc", "desc"] as const)(
    "Titel sorts alphabetically, Maßnahmen without Titel last (%s)",
    (direction) => {
      const rows = [
        row("m1", { subTitle: "Zebra" }),
        row("m2"),
        row("m3", { subTitle: "apfel" }),
        row("m4", { subTitle: "" }),
        row("m5", { subTitle: "Birne" }),
      ]
      const slugs = [...rows]
        .sort(subsubsectionRowComparator({ column: "title", direction }, { grouped: false }))
        .map((sortedRow) => sortedRow.slug)
      expect(slugs).toEqual(
        direction === "asc" ? ["m3", "m5", "m1", "m2", "m4"] : ["m1", "m5", "m3", "m2", "m4"],
      )
    },
  )

  test.each(["asc", "desc"] as const)("ties fall back to the Kürzel (%s)", (direction) => {
    const rows = [row("m10", { subTitle: "Radweg" }), row("m2", { subTitle: "Radweg" })]
    const slugs = [...rows]
      .sort(subsubsectionRowComparator({ column: "title", direction }, { grouped: false }))
      .map((sortedRow) => sortedRow.slug)
    expect(slugs).toEqual(["m2", "m10"])
  })
})
