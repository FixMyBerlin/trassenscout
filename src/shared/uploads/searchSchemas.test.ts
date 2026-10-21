import { describe, expect, test } from "vitest"
import { uploadReturnSearchSchema } from "./searchSchemas"

describe("uploadReturnSearchSchema", () => {
  test("keeps an internal return path", () => {
    expect(uploadReturnSearchSchema.parse({ returnTo: "/rs23/uploads?modalUploadId=5" })).toEqual({
      returnTo: "/rs23/uploads?modalUploadId=5",
    })
  })

  // The router's JSON search parser turns `?returnTo=5` into a number and `{…}` into an object.
  test.each([5, { a: 1 }, "https://example.com", "//example.com"])(
    "drops %j instead of failing the route",
    (returnTo) => {
      expect(uploadReturnSearchSchema.parse({ returnTo })).toEqual({ returnTo: undefined })
    },
  )
})
