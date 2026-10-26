import { describe, expect, test } from "vitest"
import { dashboardUploadsSearchSchema } from "./searchSchemas"

describe("dashboardUploadsSearchSchema", () => {
  test("keeps numeric search and tag values that the router parsed as numbers", () => {
    expect(dashboardUploadsSearchSchema.parse({ searchterm: 2024, tag: 2024 })).toEqual({
      searchterm: "2024",
      tag: "2024",
    })
  })
})
