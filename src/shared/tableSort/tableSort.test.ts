import { describe, expect, test } from "vitest"
import { z } from "zod"
import { parseTableSort, tableSortSearchSchema, tableSortSearchValue } from "./tableSort"

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
