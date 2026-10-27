import { describe, expect, test } from "vitest"
import {
  assignmentsSearchSchema,
  dashboardLayoutSearchSchema,
  dashboardUploadsSearchSchema,
} from "./searchSchemas"

describe("dashboard search schemas", () => {
  test("keep numeric search and tag values that the router parsed as numbers", () => {
    expect(dashboardUploadsSearchSchema.parse({ searchterm: 2024, tag: 2024 })).toEqual({
      searchterm: "2024",
      tag: "2024",
    })
    expect(assignmentsSearchSchema.parse({ tag: 2024 }).tag).toBe("2024")
  })

  test("drop invalid modal values instead of failing the page", () => {
    expect(
      dashboardLayoutSearchSchema.parse({ modalProjectRecordView: "foo", modalUploadView: "bar" }),
    ).toMatchObject({ modalProjectRecordView: undefined, modalUploadView: undefined })
  })
})
