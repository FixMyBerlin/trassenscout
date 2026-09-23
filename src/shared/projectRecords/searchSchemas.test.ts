import { describe, expect, test } from "vitest"
import {
  projectRecordFilterSearchValue,
  projectRecordsSearchSchema,
} from "@/src/shared/projectRecords/searchSchemas"

describe("projectRecordsSearchSchema filter", () => {
  test("keeps searchterm-only links and fills status and direction", () => {
    expect(
      projectRecordsSearchSchema.parse({
        filter: JSON.stringify({ searchterm: "brücke" }),
      }).filter,
    ).toEqual({
      searchterm: "brücke",
      status: "all",
      direction: "all",
    })
  })

  test("omits default fields and drops a fully reset filter", () => {
    expect(
      projectRecordFilterSearchValue({ searchterm: "brücke", status: "all", direction: "all" }),
    ).toEqual({ searchterm: "brücke" })
    expect(
      projectRecordFilterSearchValue({ searchterm: "", status: "all", direction: "all" }),
    ).toBeUndefined()
  })

  test("falls back to all when status or direction is unknown", () => {
    expect(
      projectRecordsSearchSchema.parse({
        filter: { searchterm: "brücke", status: "NOPE", direction: "sideways" },
      }).filter,
    ).toEqual({
      searchterm: "brücke",
      status: "all",
      direction: "all",
    })
  })
})
