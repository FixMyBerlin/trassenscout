import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordEditingState, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { createProjectRecord, updateProjectRecord } from "./projectRecords.server"

const mocks = vi.hoisted(() => ({
  projectRole: vi.fn(),
  admin: vi.fn(),
  assertProjectLeadOrAdmin: vi.fn(),
  notifyConfirmed: vi.fn(),
  assignmentMailer: vi.fn(),
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
    project: { findUnique: vi.fn().mockResolvedValue({ assignmentRepliesEnabled: false }) },
    user: { findUnique: vi.fn().mockResolvedValue({ email: "kim@example.org", firstName: "Kim" }) },
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
vi.mock("@/src/server/projectRecordEmails/notifyProjectRecordCreatedFromEmail.server", () => ({
  notifyProjectRecordFromEmailConfirmed: (...args: unknown[]) => mocks.notifyConfirmed(...args),
}))
vi.mock("@/emails/mailers/projectRecordAssignedNotificationToUser", () => ({
  projectRecordAssignedNotificationToUser: (...args: unknown[]) => mocks.assignmentMailer(...args),
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
// An admin (3) saved it from the Posteingang and it waits for the Projektleitung (7).
const waitingRecord = {
  id: 42,
  title: "Abstimmung Knotenpunkt",
  body: "Text",
  assignedToId: null,
  userId: 3,
  reviewState: ProjectRecordReviewState.NEEDSREVIEW,
  reviewedAt: null,
  projectRecordEmailId: 61,
  projectRecordEmail: { from: "max@example.org" },
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
  mocks.assignmentMailer.mockResolvedValue({ send: vi.fn() })
  mocks.findMembership.mockResolvedValue({ id: 99 })
  mocks.createRecord.mockResolvedValue(approvedRecord)
  mocks.updateRecord.mockResolvedValue(approvedRecord)
  mocks.findRecord.mockResolvedValue(waitingRecord)
})

describe("createProjectRecord from the Posteingang", () => {
  test("an entry that needs the Projektleitung is saved unconfirmed", async () => {
    mocks.createRecord.mockResolvedValue(waitingRecord)

    await createProjectRecord(headers, recordInput, {
      projectRecordEmailId: 61,
      needsConfirmation: true,
    })

    const data = mocks.createRecord.mock.calls[0]?.[0]?.data
    expect(data).toEqual(
      expect.objectContaining({
        projectRecordEmailId: 61,
        reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      }),
    )
    expect(data).not.toHaveProperty("reviewedById")
  })

  test("any other save confirms the entry", async () => {
    await createProjectRecord(headers, recordInput, { projectRecordEmailId: 61 })

    expect(mocks.createRecord.mock.calls[0]?.[0]?.data).toEqual(
      expect.objectContaining({
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewedById: 7,
        reviewedAt: expect.any(Date),
      }),
    )
  })

  test("the assignee of a waiting entry is told once it is approved", async () => {
    mocks.createRecord.mockResolvedValue({ ...waitingRecord, assignedToId: 5 })
    await createProjectRecord(
      headers,
      { ...recordInput, assignedToId: 5 },
      { projectRecordEmailId: 61, needsConfirmation: true },
    )
    expect(mocks.assignmentMailer).not.toHaveBeenCalled()

    mocks.findRecord.mockResolvedValue({ ...waitingRecord, assignedToId: 5 })
    mocks.updateRecord.mockResolvedValue({ ...approvedRecord, assignedToId: 5 })
    await updateProjectRecord(headers, {
      ...recordInput,
      id: 42,
      assignedToId: 5,
      reviewState: ProjectRecordReviewState.APPROVED,
    })
    expect(mocks.assignmentMailer).toHaveBeenCalledTimes(1)
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
    expect(mocks.notifyConfirmed).not.toHaveBeenCalled()
  })

  test("the first approval records who confirmed and tells the sender", async () => {
    await review(ProjectRecordReviewState.APPROVED)

    expect(mocks.updateRecord.mock.calls[0]?.[0]?.data).toEqual(
      expect.objectContaining({
        reviewState: ProjectRecordReviewState.APPROVED,
        reviewedById: 7,
        reviewedAt: expect.any(Date),
      }),
    )
    expect(mocks.notifyConfirmed).toHaveBeenCalledWith({
      projectId: 1,
      projectSlug: "rs8",
      projectRecord: approvedRecord,
      actorUserId: 7,
    })
  })

  test("approving again after an earlier decision mails nobody", async () => {
    mocks.findRecord.mockResolvedValue({ ...waitingRecord, reviewedAt: new Date("2026-11-01") })

    await review(ProjectRecordReviewState.APPROVED)

    expect(mocks.notifyConfirmed).not.toHaveBeenCalled()
  })

  test("rejecting a Posteingang entry hands its mail back to the Posteingang", async () => {
    mocks.updateRecord.mockResolvedValue({
      ...waitingRecord,
      reviewState: ProjectRecordReviewState.REJECTED,
    })

    await review(ProjectRecordReviewState.REJECTED)

    expect(mocks.updateRecord.mock.calls[0]?.[0]?.data).toEqual(
      expect.objectContaining({ reviewedById: 7, projectRecordEmailId: null }),
    )
    expect(mocks.notifyConfirmed).not.toHaveBeenCalled()
  })

  test("rejecting an older KI entry keeps its mail", async () => {
    mocks.findRecord.mockResolvedValue({ ...waitingRecord, userId: null })

    await review(ProjectRecordReviewState.REJECTED)

    expect(mocks.updateRecord.mock.calls[0]?.[0]?.data).not.toHaveProperty("projectRecordEmailId")
  })

  test("refuses assignees outside the project", async () => {
    mocks.findMembership.mockResolvedValue(null)

    await expect(
      updateProjectRecord(headers, { ...recordInput, id: 42, assignedToId: 9 }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    expect(mocks.updateRecord).not.toHaveBeenCalled()
  })
})
