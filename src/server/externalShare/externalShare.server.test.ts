import { beforeEach, describe, expect, test, vi } from "vitest"
import type { MembershipRole } from "@/src/server/authorization/types"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"
import {
  getExternalShare,
  removeUploadFromExternalShare,
  rotateExternalShareToken,
} from "./externalShare.server"
import { ExternalShareTokenSchema } from "./publicExternalShare.inputSchemas"

const { mockDb, mockEndpointAuth, mockCreateLogEntry, mockLoadContent } = vi.hoisted(() => ({
  mockDb: {
    project: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    upload: { findFirst: vi.fn(), update: vi.fn() },
  },
  mockEndpointAuth: { projectRole: vi.fn(), admin: vi.fn() },
  mockCreateLogEntry: vi.fn(),
  mockLoadContent: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({ endpointAuth: mockEndpointAuth }))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))
vi.mock("./_utils/externalShareContent.server", () => ({
  loadExternalShareContent: mockLoadContent,
}))

const headers = new Headers()

/** Behaves like the real guard: members whose role is not in `roles` are refused. */
function signInAs(membershipRole: MembershipRole) {
  mockEndpointAuth.projectRole.mockImplementation(
    async (_headers: Headers, _projectSlug: string, roles: MembershipRole[]) => {
      if (!roles.includes(membershipRole)) throw new AuthorizationError()
      return { projectId: 1, membershipRole, session: { userId: "7", role: "USER" } }
    },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  signInAs("EDITOR")
})

describe("getExternalShare", () => {
  beforeEach(() => {
    mockDb.project.findUniqueOrThrow.mockResolvedValue({
      externalShareEnabled: true,
      externalShareToken: "secret-link",
    })
    mockLoadContent.mockResolvedValue({ uploads: [], subsubsectionCount: 4 })
  })

  test("refuses viewers before reading the link", async () => {
    signInAs("VIEWER")

    await expect(getExternalShare(headers, { projectSlug: "rs23" })).rejects.toBeInstanceOf(
      AuthorizationError,
    )
    expect(mockDb.project.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  test("answers 404 while the admin switch is off, even though the link is kept", async () => {
    mockDb.project.findUniqueOrThrow.mockResolvedValue({
      externalShareEnabled: false,
      externalShareToken: "secret-link",
    })

    await expect(getExternalShare(headers, { projectSlug: "rs23" })).rejects.toBeInstanceOf(
      NotFoundError,
    )
    expect(mockLoadContent).not.toHaveBeenCalled()
  })

  test("gives editors the link and the shared content", async () => {
    await expect(getExternalShare(headers, { projectSlug: "rs23" })).resolves.toEqual({
      token: "secret-link",
      uploads: [],
      subsubsectionCount: 4,
    })
    expect(mockLoadContent).toHaveBeenCalledWith(1)
  })
})

describe("rotateExternalShareToken", () => {
  beforeEach(() => {
    mockEndpointAuth.admin.mockResolvedValue({ userId: "1", role: "ADMIN" })
    mockDb.project.update.mockResolvedValue({ id: 3 })
  })

  test("only admins can renew the link", async () => {
    mockEndpointAuth.admin.mockRejectedValue(new AuthorizationError())

    await expect(rotateExternalShareToken(headers, { projectSlug: "rs23" })).rejects.toBeInstanceOf(
      AuthorizationError,
    )
    expect(mockDb.project.update).not.toHaveBeenCalled()
  })

  test("stores a fresh link, which replaces the old one, and keeps it out of the log", async () => {
    await rotateExternalShareToken(headers, { projectSlug: "rs23" })

    const update = mockDb.project.update.mock.calls[0]?.[0]
    const newToken = update?.data.externalShareToken
    expect(update?.where).toEqual({ slug: "rs23" })
    expect(ExternalShareTokenSchema.safeParse(newToken).success).toBe(true)
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 3, userId: 1 }),
    )
    expect(JSON.stringify(mockCreateLogEntry.mock.calls)).not.toContain(newToken)
  })
})

describe("removeUploadFromExternalShare", () => {
  beforeEach(() => {
    mockDb.upload.findFirst.mockResolvedValue({
      id: 42,
      title: "Lageplan.pdf",
      externalShareEnabled: true,
    })
  })

  test("refuses viewers", async () => {
    signInAs("VIEWER")

    await expect(
      removeUploadFromExternalShare(headers, { projectSlug: "rs23", id: 42 }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    expect(mockDb.upload.findFirst).not.toHaveBeenCalled()
  })

  test("only finds documents of the editor's own project", async () => {
    mockDb.upload.findFirst.mockResolvedValue(null)

    await expect(
      removeUploadFromExternalShare(headers, { projectSlug: "rs23", id: 42 }),
    ).rejects.toBeInstanceOf(NotFoundError)
    expect(mockDb.upload.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 42, projectId: 1 } }),
    )
    expect(mockDb.upload.update).not.toHaveBeenCalled()
  })

  test("unshares the document and logs the change", async () => {
    await removeUploadFromExternalShare(headers, { projectSlug: "rs23", id: 42 })

    expect(mockDb.upload.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { externalShareEnabled: false, updatedById: 7 },
    })
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadId: 42,
        previousRecord: { externalShareEnabled: true },
        updatedRecord: { externalShareEnabled: false },
      }),
    )
  })

  test("leaves a document that is not shared untouched", async () => {
    mockDb.upload.findFirst.mockResolvedValue({
      id: 42,
      title: "Lageplan.pdf",
      externalShareEnabled: false,
    })

    await removeUploadFromExternalShare(headers, { projectSlug: "rs23", id: 42 })

    expect(mockDb.upload.update).not.toHaveBeenCalled()
    expect(mockCreateLogEntry).not.toHaveBeenCalled()
  })
})
