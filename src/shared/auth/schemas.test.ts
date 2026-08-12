import { describe, expect, test } from "vitest"
import { SignupSchema } from "./schemas"

const validSignup = {
  email: "user@example.com",
  password: "secure-password",
  phone: null,
  firstName: "Max",
  lastName: "Mustermann",
  institution: null,
  inviteToken: null,
  newsletter: "",
  privacyPolicyAccepted: true,
} as const

describe("SignupSchema", () => {
  test("accepts signup data with an empty honeypot field", () => {
    expect(SignupSchema.safeParse(validSignup).success).toBe(true)
  })

  test("rejects signup data when the honeypot field is filled", () => {
    const result = SignupSchema.safeParse({
      ...validSignup,
      newsletter: "yes please",
    })

    expect(result.success).toBe(false)
  })
})
