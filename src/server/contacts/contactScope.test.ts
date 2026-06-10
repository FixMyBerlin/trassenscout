import { describe, expect, test } from "vitest"
import { contactInProjectWhere } from "@/src/server/contacts/contactScope"

describe("contactInProjectWhere", () => {
  test("scopes contact queries to the project slug", () => {
    expect(contactInProjectWhere("demo-project", 42)).toEqual({
      id: 42,
      project: { slug: "demo-project" },
    })
  })
})
