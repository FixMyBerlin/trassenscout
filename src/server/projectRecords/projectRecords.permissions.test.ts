import { beforeEach, describe, expect, test, vi } from "vitest"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/browser"
import { AuthorizationError } from "@/src/shared/auth/errors"

const mockDb = {
  formTemplate: {
    findMany: vi.fn(),
  },
  projectRecordTemplate: {
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
  },
  membership: {
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
  },
  projectRecord: {
    create: vi.fn(),
    findFirstOrThrow: vi.fn(),
  },
}

const mockEndpointAuth = {
  admin: vi.fn(),
  projectRole: vi.fn(),
}

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

const mockCreateLogEntry = vi.fn().mockResolvedValue(undefined)

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

const headers = new Headers()

const createdRecord = {
  id: 42,
  title: "Vor-Ort-Termin",
  body: "Notiz",
  date: new Date("2026-09-09"),
  editingState: ProjectRecordEditingState.PENDING,
  subsubsectionId: null,
  acquisitionAreaId: null,
  assignedToId: null,
  reviewState: ProjectRecordReviewState.APPROVED,
  reviewNotes: null,
  tags: [],
  subsubsections: [],
  acquisitionAreas: [],
  uploads: [],
}

const newRecordInput = {
  projectSlug: "rs8",
  date: "2026-09-09",
  title: "Vor-Ort-Termin",
  body: "Notiz",
  subsubsectionId: null,
  acquisitionAreaId: null,
  assignedToId: null,
  editingState: ProjectRecordEditingState.PENDING,
  projectRecordTemplateId: null,
  tags: [],
  uploads: [],
  subsubsections: [],
  acquisitionAreas: [],
  formTemplates: [],
}

describe("viewer project record permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: 2, role: "USER" },
    })
    mockEndpointAuth.admin.mockRejectedValue(new AuthorizationError())
    mockDb.formTemplate.findMany.mockResolvedValue([{ id: 7 }])
    mockDb.projectRecordTemplate.findFirst.mockResolvedValue({ formTemplates: [{ id: 7 }] })
    mockDb.projectRecordTemplate.findFirstOrThrow.mockResolvedValue({ id: 3 })
    mockDb.membership.findFirst.mockResolvedValue({ id: 99 })
    mockDb.membership.findMany.mockResolvedValue([])
    mockDb.projectRecord.create.mockResolvedValue(createdRecord)
  })

  test("allows viewers to create project records", async () => {
    const { createProjectRecord } = await import("./projectRecords.server")

    const record = await createProjectRecord(headers, newRecordInput)

    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs8", ["VIEWER", "EDITOR"])
    expect(mockDb.projectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 1,
          title: "Vor-Ort-Termin",
          userId: 2,
          updatedById: 2,
          projectRecordAuthorType: ProjectRecordType.USER,
          reviewState: ProjectRecordReviewState.APPROVED,
        }),
      }),
    )
    expect(record.id).toBe(42)
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREATE", projectRecordId: 42, userId: 2 }),
    )
  })

  test("ignores form templates a non-admin submits", async () => {
    const { createProjectRecord } = await import("./projectRecords.server")

    await createProjectRecord(headers, { ...newRecordInput, formTemplates: [7] })

    expect(mockDb.projectRecordTemplate.findFirst).not.toHaveBeenCalled()
    expect(mockDb.projectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ formTemplates: { connect: [] } }),
      }),
    )
  })

  test("seeds a non-admin's entry from the picked Vorlage", async () => {
    const { createProjectRecord } = await import("./projectRecords.server")

    await createProjectRecord(headers, {
      ...newRecordInput,
      projectRecordTemplateId: 3,
      formTemplates: [99],
    })

    expect(mockDb.projectRecordTemplate.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3, projects: { some: { slug: "rs8" } } },
      }),
    )
    expect(mockDb.projectRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ formTemplates: { connect: [{ id: 7 }] } }),
      }),
    )
  })

  test("rejects uploads a viewer attaches on create", async () => {
    const { createProjectRecord } = await import("./projectRecords.server")

    await expect(
      createProjectRecord(headers, { ...newRecordInput, uploads: [7] }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.projectRecord.create).not.toHaveBeenCalled()
  })

  test("rejects assignees who are not project members", async () => {
    const { createProjectRecord } = await import("./projectRecords.server")
    mockDb.membership.findFirst.mockResolvedValueOnce(null)

    await expect(
      createProjectRecord(headers, { ...newRecordInput, assignedToId: 3 }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.projectRecord.create).not.toHaveBeenCalled()
  })

  test("keeps updating a record editor-only", async () => {
    const { updateProjectRecord } = await import("./projectRecords.server")
    mockEndpointAuth.projectRole.mockRejectedValueOnce(new AuthorizationError())

    await expect(
      updateProjectRecord(headers, {
        ...newRecordInput,
        id: 42,
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewNotes: "",
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs8", ["EDITOR"])
  })
})
