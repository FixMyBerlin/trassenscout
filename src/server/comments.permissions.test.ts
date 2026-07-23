import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthorizationError } from "@/src/shared/auth/errors"

const mockDb = {
  projectRecord: {
    findFirstOrThrow: vi.fn(),
  },
  projectRecordComment: {
    create: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
  },
  surveyResponseComment: {
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

const headers = new Headers()

describe("viewer comment permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: 2, role: "USER" },
    })
    mockDb.projectRecord.findFirstOrThrow.mockResolvedValue({ id: 125 })
    mockDb.projectRecordComment.create.mockResolvedValue({ id: 3 })
    mockDb.projectRecordComment.findFirstOrThrow.mockResolvedValue({ id: 3, userId: 2 })
    mockDb.projectRecordComment.update.mockResolvedValue({ id: 3 })
    mockDb.surveyResponseComment.findFirstOrThrow.mockResolvedValue({ id: 4, userId: 2 })
    mockDb.surveyResponseComment.update.mockResolvedValue({ id: 4 })
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
})
