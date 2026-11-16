import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordEditingState, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { createProjectRecord, updateProjectRecord } from "./projectRecords.server"

const mocks = vi.hoisted(() => ({
  projectRole: vi.fn(),
  createRecord: vi.fn(),
  findRecord: vi.fn(),
  updateRecord: vi.fn(),
  recordActivity: vi.fn(),
  addBookmarks: vi.fn(),
  sendNotification: vi.fn(),
}))

vi.mock("@/src/server/db.server", () => ({
  default: {
    membership: {
      findFirst: vi.fn().mockResolvedValue({ id: 99 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    projectRecord: {
      create: (...args: unknown[]) => mocks.createRecord(...args),
      findFirstOrThrow: (...args: unknown[]) => mocks.findRecord(...args),
      update: (...args: unknown[]) => mocks.updateRecord(...args),
    },
    subsubsection: {
      findFirstOrThrow: vi.fn().mockResolvedValue({ id: 21 }),
      findMany: vi.fn().mockResolvedValue([{ id: 22 }]),
    },
    user: { findUnique: vi.fn().mockResolvedValue(null) },
    project: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: {
    projectRole: (...args: unknown[]) => mocks.projectRole(...args),
    admin: () => Promise.reject(new AuthorizationError()),
  },
}))
vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: vi.fn().mockResolvedValue(undefined),
}))
vi.mock("@/src/server/subsubsectionBookmarks/recordSubsubsectionActivity.server", () => ({
  recordSubsubsectionActivity: (...args: unknown[]) => mocks.recordActivity(...args),
  addSubsubsectionBookmarks: (...args: unknown[]) => mocks.addBookmarks(...args),
}))
vi.mock("@/emails/mailers/projectRecordAssignedNotificationToUser", () => ({
  projectRecordAssignedNotificationToUser: vi.fn(async () => ({ send: mocks.sendNotification })),
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
const baseRecord = {
  id: 42,
  title: "Abstimmung Knotenpunkt",
  body: "Text",
  assignedToId: null,
  subsubsectionId: null,
  subsubsections: [],
  reviewState: ProjectRecordReviewState.APPROVED,
  tags: [],
  acquisitionAreas: [],
  uploads: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.projectRole.mockResolvedValue({
    projectId: 1,
    membershipRole: "EDITOR",
    session: { userId: "7", role: "USER" },
  })
  mocks.createRecord.mockResolvedValue(baseRecord)
  mocks.updateRecord.mockResolvedValue(baseRecord)
  mocks.findRecord.mockResolvedValue(baseRecord)
})

describe("createProjectRecord", () => {
  test("records the activity on the direct and the m2n Maßnahmen, and bookmarks for the assignee", async () => {
    mocks.createRecord.mockResolvedValue({
      ...baseRecord,
      assignedToId: 3,
      subsubsectionId: 21,
      subsubsections: [{ id: 22 }, { id: 21 }],
    })

    await createProjectRecord(headers, recordInput)

    expect(mocks.recordActivity).toHaveBeenCalledWith({
      subsubsectionIds: [22, 21],
      userId: 7,
    })
    expect(mocks.addBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [22, 21],
      userIds: [3, 7],
    })
  })

  test("adds no assignment bookmarks without an assignee", async () => {
    mocks.createRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21 })

    await createProjectRecord(headers, recordInput)

    expect(mocks.recordActivity).toHaveBeenCalledWith({
      subsubsectionIds: [21],
      userId: 7,
    })
    expect(mocks.addBookmarks).not.toHaveBeenCalled()
  })
})

describe("updateProjectRecord", () => {
  test("records the activity only on newly linked Maßnahmen", async () => {
    mocks.findRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21, subsubsections: [] })
    mocks.updateRecord.mockResolvedValue({
      ...baseRecord,
      subsubsectionId: 21,
      subsubsections: [{ id: 21 }, { id: 22 }],
    })

    await updateProjectRecord(headers, { ...recordInput, id: 42 })

    expect(mocks.recordActivity).toHaveBeenCalledTimes(1)
    expect(mocks.recordActivity).toHaveBeenCalledWith({
      subsubsectionIds: [22],
      userId: 7,
    })
    expect(mocks.addBookmarks).toHaveBeenCalledTimes(1)
    expect(mocks.addBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [21, 22],
      userIds: [7],
    })
  })

  test("bookmarks all linked Maßnahmen when the assignee changes to another user", async () => {
    mocks.findRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21, assignedToId: 2 })
    mocks.updateRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21, assignedToId: 3 })

    await updateProjectRecord(headers, { ...recordInput, id: 42, assignedToId: 3 })

    expect(mocks.addBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [21],
      userIds: [3, 7],
    })
    expect(mocks.recordActivity).not.toHaveBeenCalled()
  })

  test("bookmarks the Maßnahmen for the editor, without activity, when only other fields change", async () => {
    const linked = { ...baseRecord, subsubsectionId: 21, subsubsections: [{ id: 22 }] }
    mocks.findRecord.mockResolvedValue(linked)
    mocks.updateRecord.mockResolvedValue({ ...linked, title: "Neuer Titel" })

    await updateProjectRecord(headers, {
      ...recordInput,
      id: 42,
      title: "Neuer Titel",
      subsubsectionId: 21,
      subsubsections: [22],
    })

    expect(mocks.recordActivity).not.toHaveBeenCalled()
    expect(mocks.addBookmarks).toHaveBeenCalledTimes(1)
    expect(mocks.addBookmarks).toHaveBeenCalledWith({
      subsubsectionIds: [22, 21],
      userIds: [7],
    })
  })

  test("adds no assignment bookmarks when the assignee is removed", async () => {
    mocks.findRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21, assignedToId: 3 })
    mocks.updateRecord.mockResolvedValue({ ...baseRecord, subsubsectionId: 21, assignedToId: null })

    await updateProjectRecord(headers, { ...recordInput, id: 42, assignedToId: null })

    expect(mocks.addBookmarks).not.toHaveBeenCalledWith(
      expect.objectContaining({ userIds: expect.arrayContaining([3]) }),
    )
  })
})
