import { describe, expect, test } from "vitest"
import { getFullname, getFullnameWithInstitution } from "./getFullname"

describe("getFullname", () => {
  test("joins trimmed first and last names", () => {
    expect(getFullname({ firstName: " Ada ", lastName: " Lovelace " })).toBe("Ada Lovelace")
  })

  test("returns null when no name is available", () => {
    expect(getFullname({ firstName: " ", lastName: null })).toBeNull()
  })
})

describe("getFullnameWithInstitution", () => {
  test("appends the trimmed institution in parentheses", () => {
    expect(
      getFullnameWithInstitution({
        firstName: "Ada",
        institution: "Analytical Engine Lab",
        lastName: "Lovelace",
      }),
    ).toBe("Ada Lovelace (Analytical Engine Lab)")
  })

  test("skips empty institutions", () => {
    expect(
      getFullnameWithInstitution({
        firstName: "Ada",
        institution: " ",
        lastName: "Lovelace",
      }),
    ).toBe("Ada Lovelace")
  })
})
