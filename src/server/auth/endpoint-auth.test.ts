import { describe, expect, test } from "vitest"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { endpointAuth } from "./endpointAuth.server"

describe("endpoint auth", () => {
  test("endpointAuth.session rejects unauthenticated requests", async () => {
    await expect(endpointAuth.session(new Headers())).rejects.toBeInstanceOf(AuthorizationError)
  })
})
