import { beforeEach, describe, expect, test, vi } from "vitest"
import { UserRoleEnum } from "@/src/prisma/generated/browser"

const mailMocks = vi.hoisted(() => ({
  sendEditorMail: vi.fn().mockResolvedValue(undefined),
  sendInviteeMail: vi.fn().mockResolvedValue(undefined),
}))

const authMocks = vi.hoisted(() => ({
  session: vi.fn(),
}))

const mockTx = {
  invite: {
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
  membership: {
    findMany: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
  },
  user: {
    findUniqueOrThrow: vi.fn(),
  },
}

const mockDb = {
  $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) =>
    callback(mockTx),
  ),
  invite: {
    findMany: vi.fn(),
  },
  membership: {
    findMany: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    session: authMocks.session,
  },
}))

vi.mock("@/src/server/authorization/authorizeProjectMember.server", () => ({
  authorizeProjectMemberByProjectSlug: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/src/server/utils/generateSecureToken.server", () => ({
  generateSecureToken: vi.fn(() => "shared-token"),
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/emails/mailers/invitationCreatedMailToUser", () => ({
  invitationCreatedMailToUser: vi.fn().mockResolvedValue({ send: mailMocks.sendInviteeMail }),
}))

vi.mock("@/emails/mailers/invitationCreatedNotificationToEditors", () => ({
  invitationCreatedNotificationToEditors: vi
    .fn()
    .mockResolvedValue({ send: mailMocks.sendEditorMail }),
}))

describe("createInvites", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.session.mockResolvedValue({
      role: UserRoleEnum.ADMIN,
      user: { email: "admin@example.com" },
      userId: 1,
    })
    mockTx.project.findMany.mockResolvedValue([
      { id: 10, slug: "rs23", subTitle: null },
      { id: 11, slug: "rs24", subTitle: null },
    ])
    mockTx.invite.findMany.mockResolvedValue([])
    mockTx.membership.findMany.mockResolvedValue([])
    mockTx.user.findUniqueOrThrow.mockResolvedValue({
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
    })
    mockTx.invite.createMany.mockResolvedValue({ count: 2 })
    mockDb.invite.findMany.mockResolvedValue([])
    mockDb.membership.findMany.mockResolvedValue([])
    mockDb.project.findMany.mockResolvedValue([{ id: 10, slug: "rs23", subTitle: null }])
    mockDb.user.findFirst.mockResolvedValue({ id: 3 })
  })

  test("creates one pending invite row per project with a shared token", async () => {
    const { createInvites } = await import("./invites.server")

    await createInvites(new Headers(), {
      email: "Invitee@Example.com",
      projects: [
        { projectSlug: "rs23", role: "VIEWER" },
        { projectSlug: "rs24", role: "EDITOR" },
      ],
    })

    expect(mockTx.invite.createMany).toHaveBeenCalledWith({
      data: [
        {
          email: "invitee@example.com",
          inviterId: 1,
          projectId: 10,
          role: "VIEWER",
          token: "shared-token",
        },
        {
          email: "invitee@example.com",
          inviterId: 1,
          projectId: 11,
          role: "EDITOR",
          token: "shared-token",
        },
      ],
    })
    expect(mailMocks.sendInviteeMail).toHaveBeenCalledTimes(1)
  })

  test("does not fail creation when post-commit notifications fail", async () => {
    const { createInvites } = await import("./invites.server")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    mailMocks.sendInviteeMail.mockRejectedValueOnce(new Error("mail down"))

    await expect(
      createInvites(new Headers(), {
        email: "invitee@example.com",
        projects: [{ projectSlug: "rs23", role: "VIEWER" }],
      }),
    ).resolves.toMatchObject({ email: "invitee@example.com" })

    expect(mockTx.invite.createMany).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  test("rejects pending invite duplicates before writing", async () => {
    const { createInvites } = await import("./invites.server")
    mockTx.invite.findMany.mockResolvedValue([
      { project: { id: 10, slug: "rs23", subTitle: null } },
    ])

    await expect(
      createInvites(new Headers(), {
        email: "invitee@example.com",
        projects: [{ projectSlug: "rs23", role: "VIEWER" }],
      }),
    ).rejects.toThrow("besteht bereits")

    expect(mockTx.invite.createMany).not.toHaveBeenCalled()
  })

  test("rejects existing active memberships before writing", async () => {
    const { createInvites } = await import("./invites.server")
    mockTx.membership.findMany.mockResolvedValue([
      { project: { id: 10, slug: "rs23", subTitle: null } },
    ])

    await expect(
      createInvites(new Headers(), {
        email: "invitee@example.com",
        projects: [{ projectSlug: "rs23", role: "VIEWER" }],
      }),
    ).rejects.toThrow("besteht bereits")

    expect(mockTx.invite.createMany).not.toHaveBeenCalled()
  })

  test("checks existing accounts and memberships case-insensitively for status lookup", async () => {
    const { getInviteEmailStatus } = await import("./invites.server")
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 10, role: "EDITOR" }])

    await expect(
      getInviteEmailStatus(new Headers(), { email: "invitee@example.com" }),
    ).resolves.toEqual({
      accountExists: true,
      projectStates: [
        {
          current: { role: "EDITOR", type: "membership" },
          projectId: 10,
          slug: "rs23",
          subTitle: null,
        },
      ],
    })

    expect(mockDb.user.findFirst).toHaveBeenCalledWith({
      select: { id: true },
      where: { email: { equals: "invitee@example.com", mode: "insensitive" } },
    })
    expect(mockDb.membership.findMany).toHaveBeenCalledWith({
      select: { projectId: true, role: true },
      where: {
        projectId: { in: [10] },
        user: { email: { equals: "invitee@example.com", mode: "insensitive" } },
      },
    })
  })

  test("rejects invite email status lookup for non-admin users", async () => {
    const { getInviteEmailStatus } = await import("./invites.server")
    authMocks.session.mockResolvedValue({
      role: UserRoleEnum.USER,
      user: { email: "viewer@example.com" },
      userId: 2,
    })

    await expect(
      getInviteEmailStatus(new Headers(), { email: "invitee@example.com" }),
    ).rejects.toThrow("nur für Admins")

    expect(mockDb.user.findFirst).not.toHaveBeenCalled()
  })

  test("does not reveal account status when the user has no editable invite projects", async () => {
    const { getInviteEmailStatus } = await import("./invites.server")
    mockDb.project.findMany.mockResolvedValue([])

    await expect(
      getInviteEmailStatus(new Headers(), { email: "invitee@example.com" }),
    ).resolves.toEqual({
      accountExists: false,
      projectStates: [],
    })

    expect(mockDb.user.findFirst).not.toHaveBeenCalled()
    expect(mockDb.membership.findMany).not.toHaveBeenCalled()
    expect(mockDb.invite.findMany).not.toHaveBeenCalled()
  })
})
