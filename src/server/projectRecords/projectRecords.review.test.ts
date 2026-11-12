import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordEditingState, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { createProjectRecord, updateProjectRecord } from "./projectRecords.server"

const mocks = vi.hoisted(() => ({
  projectRole: vi.fn(),
  admin: vi.fn(),
  assertProjectLeadOrAdmin: vi.fn(),
  createRecord: vi.fn(),
  findRecord: vi.fn(),
  updateRecord: vi.fn(),
  findMembership: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    membership: {
      findFirst: (...args: unknown[]) => mocks.findMembership(...args),
      findMany: vi.fn().mockResolvedValue([]),
    },
    projectRecord: {
      create: (...args: unknown[]) => mocks.createRecord(...args),
      findFirstOrThrow: (...args: unknown[]) => mocks.findRecord(...args),
      update: (...args: unknown[]) => mocks.updateRecord(...args),
    },
  },
}))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    projectRole: (...args: unknown[]) => mocks.projectRole(...args),
    admin: (...args: unknown[]) => mocks.admin(...args),
  },
}))
vi.mock("@/src/server/projects/findProjectLead.server", () => ({
  assertProjectLeadOrAdmin: (...args: unknown[]) => mocks.assertProjectLeadOrAdmin(...args),
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))

const headers = new Headers()
const recordInput = {
  projectSlug: "rs8",
  date: "2026-11-03",
  title: "Abstimmung Knotenpunkt",
  body: "Text",
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
// An older KI entry: the only kind that still waits for a confirmation.
const waitingRecord = {
  id: 42,
  title: "Abstimmung Knotenpunkt",
  body: "Text",
  assignedToId: null,
  userId: null,
  reviewState: ProjectRecordReviewState.NEEDSREVIEW,
  tags: [],
  subsubsections: [],
  acquisitionAreas: [],
  uploads: [],
}
const approvedRecord = { ...waitingRecord, reviewState: ProjectRecordReviewState.APPROVED }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.projectRole.mockResolvedValue({
    projectId: 1,
    membershipRole: "EDITOR",
    session: { userId: "7", role: "USER" },
  })
  mocks.admin.mockRejectedValue(new AuthorizationError())
  mocks.assertProjectLeadOrAdmin.mockResolvedValue(undefined)
  mocks.findMembership.mockResolvedValue({ id: 99 })
  mocks.createRecord.mockResolvedValue(approvedRecord)
  mocks.updateRecord.mockResolvedValue(approvedRecord)
  mocks.findRecord.mockResolvedValue(waitingRecord)
})

describe("createProjectRecord from the Posteingang", () => {
  test("saving confirms the entry and records who saved it", async () => {
    await createProjectRecord(headers, recordInput, { projectRecordEmailId: 61 })

    expect(mocks.createRecord.mock.calls[0]?.[0]?.data).toEqual(
      expect.objectContaining({
        projectRecordEmailId: 61,
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewedById: 7,
        reviewedAt: expect.any(Date),
      }),
    )
  })
})

describe("updateProjectRecord review", () => {
  const review = (reviewState: ProjectRecordReviewState) =>
    updateProjectRecord(headers, { ...recordInput, id: 42, reviewState, reviewNotes: "" })

  test("only the Projektleitung and admins send a review decision", async () => {
    mocks.assertProjectLeadOrAdmin.mockRejectedValue(new AuthorizationError())

    await expect(review(ProjectRecordReviewState.APPROVED)).rejects.toBeInstanceOf(
      AuthorizationError,
    )
    expect(mocks.assertProjectLeadOrAdmin).toHaveBeenCalledWith({
      projectId: 1,
      userId: 7,
      membershipRole: "EDITOR",
    })
    expect(mocks.updateRecord).not.toHaveBeenCalled()
  })

  test("a save without review fields keeps the state, even if someone confirmed meanwhile", async () => {
    mocks.assertProjectLeadOrAdmin.mockRejectedValue(new AuthorizationError())
    mocks.findRecord.mockResolvedValue(approvedRecord)

    await updateProjectRecord(headers, { ...recordInput, id: 42 })

    const data = mocks.updateRecord.mock.calls[0]?.[0]?.data
    expect(data.reviewState).toBeUndefined()
    expect(data).not.toHaveProperty("reviewedById")
  })

  test("a save without a status keeps it, even if someone closed the record meanwhile", async () => {
    mocks.findRecord.mockResolvedValue(approvedRecord)

    await updateProjectRecord(headers, { ...recordInput, id: 42, editingState: undefined })

    expect(mocks.updateRecord.mock.calls[0]?.[0]?.data.editingState).toBeUndefined()
  })

  test("a review decision records who made it", async () => {
    await review(ProjectRecordReviewState.APPROVED)

    expect(mocks.updateRecord.mock.calls[0]?.[0]?.data).toEqual(
      expect.objectContaining({
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewedById: 7,
        reviewedAt: expect.any(Date),
      }),
    )
  })

  test("refuses assignees outside the project", async () => {
    mocks.findMembership.mockResolvedValue(null)

    await expect(
      updateProjectRecord(headers, { ...recordInput, id: 42, assignedToId: 9 }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    expect(mocks.updateRecord).not.toHaveBeenCalled()
  })
})
