import { describe, expect, test } from "vitest"
import { buildPseudonymEmail, buildPseudonymForUser, isFixMyCityEmail } from "./pseudonymizeUser"

describe("isFixMyCityEmail", () => {
  test("matches fixmycity.de case-insensitively", () => {
    expect(isFixMyCityEmail("tobias@fixmycity.de")).toBe(true)
    expect(isFixMyCityEmail("Alex@FixMyCity.de")).toBe(true)
  })

  test("rejects other domains", () => {
    expect(isFixMyCityEmail("a@example.com")).toBe(false)
    expect(isFixMyCityEmail("a@fixmycity.de.evil.com")).toBe(false)
  })
})

describe("buildPseudonymForUser", () => {
  test("is deterministic for a given user id", () => {
    const a = buildPseudonymForUser(1)
    const b = buildPseudonymForUser(1)
    expect(a).toEqual(b)
  })

  test("is deterministic across number and string forms of the same id", () => {
    const a = buildPseudonymForUser(42)
    const b = buildPseudonymForUser("42")
    expect(a).toEqual(b)
  })

  test("differs across user ids", () => {
    const a = buildPseudonymForUser(1)
    const b = buildPseudonymForUser(2)
    expect(a.email).not.toBe(b.email)
    expect(`${a.firstName} ${a.lastName}`).not.toBe(`${b.firstName} ${b.lastName}`)
  })

  test("produces a well-formed example.invalid address and non-empty names", () => {
    const pseudo = buildPseudonymForUser(123)
    expect(pseudo.email.endsWith("@example.invalid")).toBe(true)
    expect(pseudo.email).toMatch(/^[a-z0-9.]+@example\.invalid$/)
    expect(pseudo.firstName.length).toBeGreaterThan(0)
    expect(pseudo.lastName.length).toBeGreaterThan(0)
  })

  test("does not leak the raw id into the local part", () => {
    const pseudo = buildPseudonymForUser(99999999)
    expect(pseudo.email).not.toContain("99999999")
  })
})

describe("buildPseudonymEmail", () => {
  test("is deterministic for a given original email", () => {
    const a = buildPseudonymEmail("someone@gmail.com")
    const b = buildPseudonymEmail("someone@gmail.com")
    expect(a).toBe(b)
  })

  test("is case-insensitive on the original email", () => {
    const a = buildPseudonymEmail("Someone@Gmail.com")
    const b = buildPseudonymEmail("someone@gmail.com")
    expect(a).toBe(b)
  })

  test("differs across different original emails", () => {
    const a = buildPseudonymEmail("alice@gmail.com")
    const b = buildPseudonymEmail("bob@gmail.com")
    expect(a).not.toBe(b)
  })

  test("produces a well-formed example.invalid address", () => {
    const email = buildPseudonymEmail("someone@gmail.com")
    expect(email.endsWith("@example.invalid")).toBe(true)
    expect(email).toMatch(/^[a-z0-9.]+@example\.invalid$/)
  })

  test("does not leak the original address into the local part", () => {
    const email = buildPseudonymEmail("someone@gmail.com")
    expect(email).not.toContain("someone")
    expect(email).not.toContain("gmail")
  })
})
