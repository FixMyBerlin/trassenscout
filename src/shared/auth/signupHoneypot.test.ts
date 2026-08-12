import { describe, expect, test } from "vitest"
import { SIGNUP_HONEYPOT_FIELD, isSignupHoneypotFilled } from "./signupHoneypot"

describe("isSignupHoneypotFilled", () => {
  test("returns false for missing, null, or empty honeypot values", () => {
    expect(isSignupHoneypotFilled({})).toBe(false)
    expect(isSignupHoneypotFilled({ [SIGNUP_HONEYPOT_FIELD]: null })).toBe(false)
    expect(isSignupHoneypotFilled({ [SIGNUP_HONEYPOT_FIELD]: "" })).toBe(false)
    expect(isSignupHoneypotFilled({ [SIGNUP_HONEYPOT_FIELD]: "   " })).toBe(false)
  })

  test("returns true when the honeypot field contains text", () => {
    expect(isSignupHoneypotFilled({ [SIGNUP_HONEYPOT_FIELD]: "subscribe" })).toBe(true)
  })
})
