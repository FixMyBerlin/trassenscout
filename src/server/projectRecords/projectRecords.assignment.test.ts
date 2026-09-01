import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/browser"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"
import { PatchProjectRecordAssignmentSchema } from "@/src/shared/projectRecords/schemas"

const mockCreateLogEntry = vi.fn().mockResolvedValue(undefined)
const mockSend = vi.fn().mockResolvedValue(undefined)

const mockDb = {
  membership: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
  },
  projectRecord: {
    findFirstOrThrow: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}

const mockEndpointAuth = {
  projectRole: vi.fn(),
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

vi.mock("@/emails/mailers/projectRecordAssignedNotificationToUser", () => ({
  projectRecordAssignedNotificationToUser: vi.fn(async () => ({ send: mockSend })),
}))

const headers = new Headers()
const previousRecord = {
  id: 12,
  title: "Protokoll",
  assignedToId: null,
  editingState: ProjectRecordEditingState.PENDING,
}

describe("PatchProjectRecordAssignmentSchema", () => {
  test("rejects extra fields", () => {
    const parsed = PatchProjectRecordAssignmentSchema.safeParse({
      projectSlug: "rs23",
      id: 12,
      assignedToId: 3,
      editingState: ProjectRecordEditingState.PENDING,
      title: "should not be here",
    })

    expect(parsed.success).toBe(false)
  })

  test("rejects missing required fields", () => {
    const parsed = PatchProjectRecordAssignmentSchema.safeParse({
      projectSlug: "rs23",
      id: 12,
      assignedToId: 3,
    })

    expect(parsed.success).toBe(false)
  })
})

describe("patchProjectRecordAssignment", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: 2, role: "USER" },
    })
    mockDb.membership.findFirst.mockResolvedValue({ id: 99 })
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 1, userId: 2 }])
    mockDb.project.findUnique.mockResolvedValue({ aiEnabled: true })
    mockDb.projectRecord.update.mockResolvedValue({
      title: "Protokoll",
      assignedToId: 3,
      editingState: ProjectRecordEditingState.COMPLETED,
    })
    mockDb.user.findUnique.mockResolvedValue({
      email: "a@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
    })
  })

  test("allows viewers to patch assignment and status and writes a log entry", async () => {
    mockDb.projectRecord.findFirstOrThrow.mockResolvedValueOnce(previousRecord)
    const { patchProjectRecordAssignment } = await import("./projectRecords.server")

    await patchProjectRecordAssignment(headers, {
      projectSlug: "rs23",
      id: 12,
      assignedToId: 3,
      editingState: ProjectRecordEditingState.COMPLETED,
    })

    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs23", ["VIEWER", "EDITOR"])
    expect(mockDb.projectRecord.findFirstOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 12,
          projectId: 1,
          OR: [{ reviewState: ProjectRecordReviewState.APPROVED }],
        },
      }),
    )
    expect(mockDb.projectRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 12 },
        data: expect.objectContaining({
          assignedToId: 3,
          editingState: ProjectRecordEditingState.COMPLETED,
          updatedById: 2,
          projectRecordUpdatedByType: ProjectRecordType.USER,
        }),
      }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledTimes(2)
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        projectRecordId: 12,
        userId: 2,
        message: expect.stringContaining("zugewiesen"),
      }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        projectRecordId: 12,
        userId: 2,
        message: expect.stringContaining("Bearbeitungsstatus"),
      }),
    )
  })

  test("rejects assignees who are not project members", async () => {
    const { patchProjectRecordAssignment } = await import("./projectRecords.server")
    mockDb.membership.findFirst.mockResolvedValueOnce(null)

    await expect(
      patchProjectRecordAssignment(headers, {
        projectSlug: "rs23",
        id: 12,
        assignedToId: 3,
        editingState: ProjectRecordEditingState.PENDING,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.projectRecord.update).not.toHaveBeenCalled()
  })

  test("rejects viewer patches for records that are not visible", async () => {
    mockDb.projectRecord.findFirstOrThrow.mockRejectedValueOnce(new Error("No ProjectRecord found"))
    const { patchProjectRecordAssignment } = await import("./projectRecords.server")

    await expect(
      patchProjectRecordAssignment(headers, {
        projectSlug: "rs23",
        id: 12,
        assignedToId: 3,
        editingState: ProjectRecordEditingState.PENDING,
      }),
    ).rejects.toThrow("No ProjectRecord found")

    expect(mockDb.projectRecord.update).not.toHaveBeenCalled()
  })
})

describe("deleteProjectRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.projectRecord.findFirst.mockResolvedValue({
      id: 12,
      title: "Protokoll",
    })
    mockDb.projectRecord.deleteMany.mockResolvedValue({ count: 1 })
  })

  test("writes a delete log entry", async () => {
    const { deleteProjectRecord } = await import("./projectRecords.server")

    await deleteProjectRecord(headers, { projectSlug: "rs23", id: 12 })

    expect(mockDb.projectRecord.deleteMany).toHaveBeenCalled()
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE",
        userId: 2,
        projectSlug: "rs23",
        message: expect.stringContaining("Protokoll"),
      }),
    )
  })

  test("throws NotFoundError when the record is missing", async () => {
    const { deleteProjectRecord } = await import("./projectRecords.server")
    mockDb.projectRecord.findFirst.mockResolvedValueOnce(null)

    await expect(
      deleteProjectRecord(headers, { projectSlug: "rs23", id: 12 }),
    ).rejects.toBeInstanceOf(NotFoundError)

    expect(mockDb.projectRecord.deleteMany).not.toHaveBeenCalled()
    expect(mockCreateLogEntry).not.toHaveBeenCalled()
  })
})
