import { describe, expect, test } from "vitest"
import {
  AuthenticationError,
  AuthorizationError,
  authMessages,
  isAuthorizationError,
  isNotAuthenticatedError,
} from "@/src/shared/auth/errors"

describe("auth error helpers", () => {
  test("detects not-authenticated after server-fn deserialization", () => {
    const error = new Error(authMessages.notAuthenticated)

    expect(isNotAuthenticatedError(error)).toBe(true)
    expect(isAuthorizationError(error)).toBe(true)
  })

  test("detects typed authorization errors", () => {
    expect(isNotAuthenticatedError(new AuthorizationError())).toBe(true)
    expect(isNotAuthenticatedError(new AuthenticationError())).toBe(true)
  })
})
