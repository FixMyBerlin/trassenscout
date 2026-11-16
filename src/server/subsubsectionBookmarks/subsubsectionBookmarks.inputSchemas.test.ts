import { describe, expect, test } from "vitest"
import { GetSubsubsectionBookmarkSchema } from "./subsubsectionBookmarks.inputSchemas"

describe("GetSubsubsectionBookmarkSchema", () => {
  const parse = (subsubsectionId: number) =>
    GetSubsubsectionBookmarkSchema.safeParse({ projectSlug: "rs23", subsubsectionId })

  test("accepts a positive integer id", () => {
    expect(parse(5).success).toBe(true)
  })

  test.each([0, -1, 1.5])("rejects %s", (id) => {
    expect(parse(id).success).toBe(false)
  })
})
