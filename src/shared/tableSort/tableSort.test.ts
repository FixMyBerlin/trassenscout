import { describe, expect, test } from "vitest"
import { z } from "zod"
import {
  nextTableSort,
  parseTableSort,
  tableSortSearchSchema,
  tableSortSearchValue,
  toggleTableSortSearchValue,
} from "./tableSort"

const columns = ["slug", "status", "updatedAt"] as const
const defaultSort = { column: "slug", direction: "asc" } as const

describe("parseTableSort", () => {
  test("parses column and direction", () => {
    expect(parseTableSort("updatedAt.desc", columns)).toEqual({
      column: "updatedAt",
      direction: "desc",
    })
  })

  test.each(["foo.asc", "status", "status.up", "", 1, { column: "slug" }, undefined])(
    "rejects %o",
    (value) => {
      expect(parseTableSort(value, columns)).toBeUndefined()
    },
  )
})

describe("tableSortSearchSchema", () => {
  test("keeps valid values and drops invalid ones without throwing", () => {
    const schema = z.object({ sort: tableSortSearchSchema(columns) })
    expect(schema.parse({ sort: "status.asc" }).sort).toBe("status.asc")
    expect(schema.parse({ sort: "foo.asc" }).sort).toBeUndefined()
    expect(schema.parse({ sort: 123 }).sort).toBeUndefined()
    expect(schema.parse({}).sort).toBeUndefined()
  })
})

describe("nextTableSort", () => {
  test("a new column starts ascending, the active one flips", () => {
    expect(nextTableSort(undefined, "title")).toEqual({ column: "title", direction: "asc" })
    expect(nextTableSort({ column: "date", direction: "desc" }, "title")).toEqual({
      column: "title",
      direction: "asc",
    })
    expect(nextTableSort({ column: "title", direction: "asc" }, "title")).toEqual({
      column: "title",
      direction: "desc",
    })
    expect(nextTableSort({ column: "title", direction: "desc" }, "title")).toEqual({
      column: "title",
      direction: "asc",
    })
  })
})

describe("toggleTableSortSearchValue", () => {
  test("each click toggles from the previous URL value", () => {
    const first = toggleTableSortSearchValue(undefined, "status", columns, defaultSort)
    expect(first).toBe("status.asc")
    expect(toggleTableSortSearchValue(first, "status", columns, defaultSort)).toBe("status.desc")
  })

  test("the default column flips, and flipping back leaves the URL", () => {
    expect(toggleTableSortSearchValue(undefined, "slug", columns, defaultSort)).toBe("slug.desc")
    expect(toggleTableSortSearchValue("slug.desc", "slug", columns, defaultSort)).toBeUndefined()
  })

  test("an invalid URL value counts as the default", () => {
    expect(toggleTableSortSearchValue("foo.asc", "slug", columns, defaultSort)).toBe("slug.desc")
  })
})

describe("tableSortSearchValue", () => {
  test("leaves the default out of the URL", () => {
    expect(tableSortSearchValue({ column: "slug", direction: "asc" }, defaultSort)).toBeUndefined()
    expect(tableSortSearchValue({ column: "slug", direction: "desc" }, defaultSort)).toBe(
      "slug.desc",
    )
    expect(tableSortSearchValue({ column: "status", direction: "asc" }, undefined)).toBe(
      "status.asc",
    )
  })
})
