import { describe, expect, it } from "vitest"
import { ContactSchema } from "./schemas"

const parsePhone = (phone: string | null | undefined) =>
  ContactSchema.safeParse({ tags: [], phone })

const phoneIssues = (phone: string | null | undefined) => {
  const parsed = parsePhone(phone)
  return parsed.success ? [] : parsed.error.issues.filter((issue) => issue.path[0] === "phone")
}

describe("ContactSchema phone", () => {
  it("accepts the notation contacts are written with", () => {
    for (const phone of ["030-123 123", "+49 (0)30 12 34-56", "0301234567", "030/123456"]) {
      expect(parsePhone(phone).success, phone).toBe(true)
    }
  })

  it("rejects letters and other characters", () => {
    for (const phone of ["030 Durchwahl 12", "keine", "030#123"]) {
      expect(phoneIssues(phone), phone).toHaveLength(1)
    }
  })

  it("rejects separators without a digit", () => {
    expect(phoneIssues("---")).toHaveLength(1)
  })

  it("treats an empty phone as not given", () => {
    const parsed = parsePhone("")
    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data.phone).toBe(null)
  })

  it("allows a missing phone", () => {
    expect(parsePhone(null).success).toBe(true)
    expect(parsePhone(undefined).success).toBe(true)
  })
})

describe("ContactSchema blank fields", () => {
  it("stores a blank or whitespace-only field as null, never an empty string", () => {
    const parsed = ContactSchema.safeParse({
      firstName: "",
      lastName: "   ",
      email: "",
      note: "",
      phone: "",
      role: "",
      tags: [],
    })

    expect(parsed.success).toBe(true)
    expect(parsed.success && parsed.data).toMatchObject({
      firstName: null,
      lastName: null,
      email: null,
      note: null,
      phone: null,
      role: null,
    })
  })

  it("trims what is kept", () => {
    const parsed = ContactSchema.safeParse({ lastName: "  Müller  ", tags: [] })

    expect(parsed.success && parsed.data.lastName).toBe("Müller")
  })
})
