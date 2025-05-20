import db from "@/db"
import previewEmail from "preview-email"
import { beforeEach, describe, expect, it, vi } from "vitest"
import signup from "./signup"

beforeEach(async () => {
  await db.$reset()
})

const mockCtx: any = {
  session: {
    $create: vi.fn(),
  },
}

vi.mock("preview-email", () => ({ default: vi.fn() }))

describe("signup mutation", () => {
  it("minimal case", async () => {
    expect(true).toBe(true)
    const input = {
      email: "signup-test@example.com",
      firstName: "signup_test_firstName",
      lastName: "signup_test_lastName",
      password: "signup_test_password",
      phone: "signup_test_phone",
      institution: "signup_test_institution",
      inviteToken: null,
    }
    await expect(signup(input, mockCtx)).resolves.not.toThrow()
    expect(previewEmail).toBeCalled()
  })
})
