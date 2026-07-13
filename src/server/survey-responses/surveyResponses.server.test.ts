import { beforeEach, describe, expect, test, vi } from "vitest"

const mockTx = {
  surveyResponse: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  surveySession: {
    deleteMany: vi.fn(),
  },
}

const mockDb = {
  upload: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  surveyResponse: {
    findFirstOrThrow: vi.fn(),
    findFirst: vi.fn(),
  },
  subsubsection: {
    findFirst: vi.fn(),
  },
  surveySession: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(async (callback: (tx: typeof mockTx) => Promise<unknown>) =>
    callback(mockTx),
  ),
}

const mockEndpointAuth = {
  admin: vi.fn(),
  projectRole: vi.fn(),
}

const mockDeleteUploadFileAndDbRecord = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

vi.mock("@/src/server/uploads/_utils/deleteUploadFileAndDbRecord", () => ({
  deleteUploadFileAndDbRecord: mockDeleteUploadFileAndDbRecord,
}))

const headers = new Headers()

describe("deleteSurveyResponseAsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.admin.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mockDb.surveyResponse.findFirstOrThrow.mockResolvedValue({ id: 42 })
    mockDb.upload.findFirst.mockResolvedValue(null)
    mockDb.surveyResponse.findFirst.mockResolvedValue(null)
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    mockDb.upload.findMany.mockResolvedValue([])
    mockTx.surveyResponse.findMany.mockResolvedValue([{ surveySessionId: 7 }])
    mockTx.surveyResponse.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.surveySession.deleteMany.mockResolvedValue({ count: 1 })
    mockDeleteUploadFileAndDbRecord.mockResolvedValue(undefined)
  })

  test("requires admin auth", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")
    mockEndpointAuth.admin.mockRejectedValue(new Error("Not authorized"))

    await expect(
      deleteSurveyResponseAsAdmin(headers, { projectSlug: "rs23", id: 42 }),
    ).rejects.toThrow("Not authorized")

    expect(mockDb.surveyResponse.findFirstOrThrow).not.toHaveBeenCalled()
  })

  test("deletes the response and orphaned session in a transaction", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")

    await deleteSurveyResponseAsAdmin(headers, { projectSlug: "rs23", id: 42 })

    expect(mockEndpointAuth.admin).toHaveBeenCalledWith(headers)
    expect(mockDb.surveyResponse.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 42, surveySession: { survey: { project: { slug: "rs23" } } } },
      select: { id: true },
    })
    expect(mockDb.upload.findMany).toHaveBeenCalledWith({
      where: {
        surveyResponseId: { in: [42] },
        projectRecordEmailId: null,
        projectRecords: { none: {} },
        subsubsections: { none: {} },
        acquisitionAreas: { none: {} },
        tags: { none: {} },
      },
      select: {
        id: true,
        externalUrl: true,
        collaborationUrl: true,
        collaborationPath: true,
      },
    })
    expect(mockTx.surveyResponse.deleteMany).toHaveBeenCalledWith({ where: { id: { in: [42] } } })
    expect(mockTx.surveySession.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [7] }, responses: { none: {} } },
    })
  })

  test("deletes orphaned uploads after the transaction commits", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")
    const upload = {
      id: 99,
      externalUrl: "https://example.com/file.pdf",
      collaborationUrl: null,
      collaborationPath: null,
    }
    mockDb.upload.findMany.mockResolvedValue([upload])

    await deleteSurveyResponseAsAdmin(headers, { projectSlug: "rs23", id: 42 })

    expect(mockDeleteUploadFileAndDbRecord).toHaveBeenCalledWith(upload)
  })

  test("continues when orphaned upload file deletion fails", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    mockDb.upload.findMany.mockResolvedValue([
      {
        id: 99,
        externalUrl: "https://example.com/file.pdf",
        collaborationUrl: null,
        collaborationPath: null,
      },
    ])
    mockDeleteUploadFileAndDbRecord.mockRejectedValue(new Error("S3 unavailable"))

    await expect(
      deleteSurveyResponseAsAdmin(headers, { projectSlug: "rs23", id: 42 }),
    ).resolves.toBeUndefined()

    expect(warnSpy).toHaveBeenCalledWith("Failed to delete orphaned upload 99:", expect.any(Error))
    warnSpy.mockRestore()
  })

  test("rejects deletion when the response is linked to a subsubsection via referenceId", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")
    mockDb.upload.findFirst.mockResolvedValue(null)
    mockDb.surveyResponse.findFirst.mockResolvedValue({
      data: JSON.stringify({ referenceId: "547010_12", commune: "erlangen" }),
      surveySession: { survey: { project: { slug: "ohv" } } },
    })
    mockDb.subsubsection.findFirst.mockResolvedValue({ id: 5, slug: "547010_12" })

    await expect(
      deleteSurveyResponseAsAdmin(headers, { projectSlug: "ohv", id: 42 }),
    ).rejects.toThrow(
      'Eintrag 42 kann nicht gelöscht werden, weil er mit der Maßnahme „547010_12" (ID 5) verknüpft ist.',
    )

    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })

  test("rejects deletion when an upload links the response to a subsubsection", async () => {
    const { deleteSurveyResponseAsAdmin } = await import("./surveyResponses.server")
    mockDb.upload.findFirst.mockResolvedValue({
      subsubsections: [{ id: 8, slug: "haltestelle-a" }],
    })

    await expect(
      deleteSurveyResponseAsAdmin(headers, { projectSlug: "rs23", id: 42 }),
    ).rejects.toThrow(
      'Eintrag 42 kann nicht gelöscht werden, weil er mit der Maßnahme „haltestelle-a" (ID 8) verknüpft ist.',
    )

    expect(mockDb.surveyResponse.findFirst).not.toHaveBeenCalled()
    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })
})

describe("deleteTestSurveyResponses", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.admin.mockResolvedValue({ userId: 1, role: "ADMIN" })
    mockDb.upload.findFirst.mockResolvedValue(null)
    mockDb.surveyResponse.findFirst.mockResolvedValue(null)
    mockDb.subsubsection.findFirst.mockResolvedValue(null)
    mockDb.upload.findMany.mockResolvedValue([])
    mockTx.surveyResponse.findMany.mockResolvedValue([{ surveySessionId: 3 }])
    mockTx.surveyResponse.deleteMany.mockResolvedValue({ count: 2 })
    mockTx.surveySession.deleteMany.mockResolvedValue({ count: 1 })
  })

  test("deletes the given test responses and orphaned sessions", async () => {
    const { deleteTestSurveyResponses } = await import("./surveyResponses.server")

    await deleteTestSurveyResponses(headers, { slug: "frm7", deleteIds: [10, 11] })

    expect(mockEndpointAuth.admin).toHaveBeenCalledWith(headers)
    expect(mockDb.upload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          surveyResponseId: { in: [10, 11] },
        }),
      }),
    )
    expect(mockTx.surveyResponse.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
    })
    expect(mockTx.surveySession.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [3] }, responses: { none: {} } },
    })
  })
})

describe("getGroupedSurveyResponses", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({ userId: 1 })
  })

  test("counts only sessions with submitted responses", async () => {
    const { getGroupedSurveyResponses } = await import("./surveyResponses.server")
    mockDb.surveySession.findMany.mockResolvedValue([
      {
        id: 1,
        responses: [{ id: 10, surveyPart: 2, state: "SUBMITTED", data: "{}" }],
        survey: { slug: "frm7" },
      },
      { id: 2, responses: [], survey: { slug: "frm7" } },
      {
        id: 3,
        responses: [{ id: 11, surveyPart: 2, state: "CREATED", data: "{}" }],
        survey: { slug: "frm7" },
      },
    ])

    const result = await getGroupedSurveyResponses(headers, {
      projectSlug: "rs23",
      surveyId: 5,
    })

    expect(result.count).toBe(1)
  })
})
