import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthorizationError } from "@/src/shared/auth/errors"

const mockDb = {
  membership: {
    findMany: vi.fn().mockResolvedValue([{ userId: 2 }]),
  },
  projectRecord: {
    findFirstOrThrow: vi.fn(),
  },
  projectRecordComment: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  surveyResponse: {
    findFirstOrThrow: vi.fn(),
  },
  surveyResponseComment: {
    deleteMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
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

const mockCreateLogEntry = vi.fn().mockResolvedValue(undefined)

vi.mock("@/src/server/logEntries/create/createLogEntry", () => ({
  createLogEntry: mockCreateLogEntry,
}))

const headers = new Headers()

const projectRecordContext = {
  id: 125,
  title: "Protokoll",
  projectId: 1,
}

const surveyResponseContext = {
  id: 55,
  surveySession: {
    survey: {
      title: "Feedback",
      projectId: 1,
    },
  },
}

const ownProjectRecordComment = {
  id: 3,
  userId: 2,
  body: "Alt",
  projectRecord: projectRecordContext,
}

const ownSurveyResponseComment = {
  id: 4,
  userId: 2,
  body: "Alt",
  surveyResponse: surveyResponseContext,
}

describe("viewer comment permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: 2, role: "USER" },
    })
    mockDb.projectRecord.findFirstOrThrow.mockResolvedValue(projectRecordContext)
    mockDb.projectRecordComment.create.mockResolvedValue({ id: 3 })
    mockDb.projectRecordComment.findFirstOrThrow.mockResolvedValue(ownProjectRecordComment)
    mockDb.projectRecordComment.deleteMany.mockResolvedValue({ count: 1 })
    mockDb.projectRecordComment.update.mockResolvedValue({
      id: 3,
      body: "Geändert",
      author: { id: 2 },
    })
    mockDb.surveyResponse.findFirstOrThrow.mockResolvedValue(surveyResponseContext)
    mockDb.surveyResponseComment.findFirstOrThrow.mockResolvedValue(ownSurveyResponseComment)
    mockDb.surveyResponseComment.deleteMany.mockResolvedValue({ count: 1 })
    mockDb.surveyResponseComment.update.mockResolvedValue({
      id: 4,
      body: "Geändert",
      author: { id: 2 },
    })
  })

  test("allows viewers to create project record comments", async () => {
    const { createProjectRecordComment } =
      await import("./project-record-comments/projectRecordComments.server")

    await createProjectRecordComment(headers, {
      projectSlug: "rs8",
      projectRecordId: 125,
      body: "Kommentar",
    })

    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs8", ["VIEWER", "EDITOR"])
    expect(mockDb.projectRecordComment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectRecordId: 125,
          userId: 2,
        }),
      }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        projectRecordId: 125,
        projectRecordCommentId: 3,
        userId: 2,
      }),
    )
  })

  test("allows viewers to update their own survey response comments", async () => {
    const { updateSurveyResponseComment } =
      await import("./survey-response-comments/surveyResponseComments.server")

    await updateSurveyResponseComment(headers, {
      projectSlug: "rs8",
      id: 4,
      body: "Geändert",
    })

    expect(mockDb.surveyResponseComment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 4 },
        data: { body: "Geändert" },
      }),
    )
  })

  test("allows viewers to update their own project record comments", async () => {
    const { updateProjectRecordComment } =
      await import("./project-record-comments/projectRecordComments.server")

    await updateProjectRecordComment(headers, {
      projectSlug: "rs8",
      id: 3,
      body: "Geändert",
    })

    expect(mockDb.projectRecordComment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 3 },
        data: { body: "Geändert" },
      }),
    )
  })

  test("allows viewers to delete their own survey response comments", async () => {
    const { deleteSurveyResponseComment } =
      await import("./survey-response-comments/surveyResponseComments.server")

    const result = await deleteSurveyResponseComment(headers, {
      projectSlug: "rs8",
      id: 4,
    })

    expect(result).toEqual({ count: 1 })
    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs8", ["VIEWER", "EDITOR"])
    expect(mockDb.surveyResponseComment.deleteMany).toHaveBeenCalledWith({
      where: { id: 4, surveyResponse: { surveySession: { survey: { project: { slug: "rs8" } } } } },
    })
  })

  test("allows viewers to delete their own project record comments", async () => {
    const { deleteProjectRecordComment } =
      await import("./project-record-comments/projectRecordComments.server")

    const result = await deleteProjectRecordComment(headers, {
      projectSlug: "rs8",
      id: 3,
    })

    expect(result).toEqual({ count: 1 })
    expect(mockEndpointAuth.projectRole).toHaveBeenCalledWith(headers, "rs8", ["VIEWER", "EDITOR"])
    expect(mockDb.projectRecordComment.deleteMany).toHaveBeenCalledWith({
      where: { id: 3, projectRecord: { project: { slug: "rs8" } } },
    })
  })

  test("rejects viewer updates for comments from other users", async () => {
    const { updateSurveyResponseComment } =
      await import("./survey-response-comments/surveyResponseComments.server")
    mockDb.surveyResponseComment.findFirstOrThrow.mockResolvedValueOnce({ id: 4, userId: 99 })

    await expect(
      updateSurveyResponseComment(headers, {
        projectSlug: "rs8",
        id: 4,
        body: "Nicht erlaubt",
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.surveyResponseComment.update).not.toHaveBeenCalled()
  })

  test("rejects viewer deletes for comments from other users", async () => {
    const { deleteProjectRecordComment } =
      await import("./project-record-comments/projectRecordComments.server")
    const { deleteSurveyResponseComment } =
      await import("./survey-response-comments/surveyResponseComments.server")
    mockDb.projectRecordComment.findFirstOrThrow.mockResolvedValueOnce({ id: 3, userId: 99 })
    mockDb.surveyResponseComment.findFirstOrThrow.mockResolvedValueOnce({ id: 4, userId: 99 })

    await expect(
      deleteProjectRecordComment(headers, {
        projectSlug: "rs8",
        id: 3,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    await expect(
      deleteSurveyResponseComment(headers, {
        projectSlug: "rs8",
        id: 4,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.projectRecordComment.deleteMany).not.toHaveBeenCalled()
    expect(mockDb.surveyResponseComment.deleteMany).not.toHaveBeenCalled()
  })

  test("returns the deleteMany count for project record comments", async () => {
    const { deleteProjectRecordComment } =
      await import("./project-record-comments/projectRecordComments.server")
    mockDb.projectRecordComment.deleteMany.mockResolvedValueOnce({ count: 0 })

    const result = await deleteProjectRecordComment(headers, {
      projectSlug: "rs8",
      id: 3,
    })

    expect(result).toEqual({ count: 0 })
  })
})
