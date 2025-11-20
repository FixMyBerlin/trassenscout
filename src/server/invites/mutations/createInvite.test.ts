import db from "@/db"
import previewEmail from "preview-email"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"
import signup from "../../auth/mutations/signup"
import createProject from "../../projects/mutations/createProject"
import createInvite, { CreateInviteSchema } from "./createInvite"

beforeEach(async () => {
  await db.$reset()
})

const mockCtx: any = {
  session: {
    $create: vi.fn(),
    $authorize: vi.fn(),
    userId: 1,
    role: "ADMIN",
  },
} // satisfies Ctx

vi.mock("preview-email", () => ({ default: vi.fn() }))

describe("createInvite mutation", () => {
  it("minimal", async () => {
    expect(true).toBe(true)

    // Create Project
    const project = await createProject(
      { slug: "test", exportEnabled: false, aiEnabled: false },
      mockCtx,
    )
    expect(project.slug).toBe("test")

    // Create Inviter
    const inviterUser = await signup(
      {
        email: "signup-test@example.com",
        firstName: "signup_test_firstName",
        lastName: "signup_test_lastName",
        password: "signup_test_password",
        phone: "signup_test_phone",
        institution: "signup_test_institution",
        inviteToken: null,
      },
      mockCtx,
    )
    expect(inviterUser.id).toBe(mockCtx.session.userId)

    // Create Invite
    const invite = createInvite(
      {
        email: "createInvite-test@example.com",
        role: "EDITOR",
        projectSlug: project.slug,
      } satisfies z.infer<typeof CreateInviteSchema>,
      mockCtx,
    )
    await expect(invite).resolves.not.toThrow()
    expect(previewEmail).toBeCalled()

    // Invite: Check presence
    const numberOfInvites = await db.invite.count()
    expect(numberOfInvites).toBe(1)

    // Invite: Check system logs
    const numberOfSystemLogEntries = await db.systemLogEntry.count()
    expect(numberOfSystemLogEntries).toBe(0)

    // Invite: Check logs
    const numberOfLogEntries = await db.logEntry.count()
    expect(numberOfLogEntries).toBe(1)
    // console.log("LOG ENTRY", await db.logEntry.findFirst())
  })
})
