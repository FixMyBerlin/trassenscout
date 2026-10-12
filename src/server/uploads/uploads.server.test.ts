import { beforeEach, describe, expect, test, vi } from "vitest"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { AuthorizationError } from "@/src/shared/auth/errors"
import { GetUploadsWithSubsectionsSchema } from "./uploads.inputSchemas"

const mockDeleteObject = vi.fn()
const mockS3Client = { client: "s3" }
const mockDb = {
  membership: {
    findMany: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
  },
  surveyResponse: {
    findFirstOrThrow: vi.fn(),
  },
  operator: {
    findFirstOrThrow: vi.fn(),
  },
  projectRecord: {
    findMany: vi.fn(),
  },
  subsubsection: {
    findMany: vi.fn(),
  },
  acquisitionArea: {
    findMany: vi.fn(),
  },
  tag: {
    findMany: vi.fn(),
  },
  upload: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
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

vi.mock("@/src/server/uploads/_utils/s3Client.server", () => ({
  getConfiguredS3Client: () => mockS3Client,
  getAwsSdkS3Client: () => mockS3Client,
}))

vi.mock("@better-upload/server/helpers", () => ({
  deleteObject: mockDeleteObject,
}))

const headers = new Headers()

const projectExternalUrl =
  "https://trassenscout.s3.eu-central-1.amazonaws.com/upload-localdev/rs23/uuid/document.pdf"
const replacementExternalUrl =
  "https://trassenscout.s3.eu-central-1.amazonaws.com/upload-localdev/rs23/uuid/document-v2.pdf"
const otherProjectExternalUrl =
  "https://trassenscout.s3.eu-central-1.amazonaws.com/upload-localdev/other-project/uuid/document.pdf"

const baseInput = {
  projectSlug: "rs23",
  title: "document.pdf",
  externalUrl: projectExternalUrl,
  summary: null,
  projectRecordEmailId: null,
  surveyResponseId: 123,
  mimeType: "application/pdf",
  fileSize: 1234,
  latitude: null,
  longitude: null,
  collaborationUrl: null,
  collaborationPath: null,
  projectRecords: [],
  subsubsections: [],
  acquisitionAreas: [],
  tags: [],
}

describe("createUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.S3_UPLOAD_ROOTFOLDER = "upload-localdev"
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: 2, role: "USER" },
    })
    mockDb.surveyResponse.findFirstOrThrow.mockResolvedValue({ id: 123 })
    mockDb.project.findUnique.mockResolvedValue({ aiEnabled: true })
    mockDb.projectRecord.findMany.mockResolvedValue([])
    mockDb.upload.findFirstOrThrow.mockResolvedValue({ id: 77 })
    mockDb.upload.findMany.mockResolvedValue([])
    mockDb.upload.create.mockResolvedValue({ id: 77, title: "document.pdf" })
    mockDb.upload.update.mockResolvedValue({ id: 77 })
    mockDb.membership.findMany.mockResolvedValue([{ projectId: 1, userId: 2 }])
    mockDeleteObject.mockResolvedValue(undefined)
  })

  test("rejects viewer upload records with S3 keys outside the project prefix", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, { ...baseInput, externalUrl: otherProjectExternalUrl }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.surveyResponse.findFirstOrThrow).not.toHaveBeenCalled()
    expect(mockDb.upload.create).not.toHaveBeenCalled()
  }, 15_000)

  test("rejects editor upload records with S3 keys outside the project prefix", async () => {
    const { createUpload } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })

    await expect(
      createUpload(headers, { ...baseInput, externalUrl: otherProjectExternalUrl }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.surveyResponse.findFirstOrThrow).not.toHaveBeenCalled()
    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("allows viewer survey-response uploads with an empty summary", async () => {
    const { createUpload } = await import("./uploads.server")

    await createUpload(headers, { ...baseInput, summary: "" })

    expect(mockDb.surveyResponse.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        id: 123,
        surveySession: { survey: { project: { slug: "rs23" } } },
      },
      select: { id: true },
    })
    expect(mockDb.upload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 1,
          surveyResponseId: 123,
          externalUrl: projectExternalUrl,
        }),
      }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        uploadId: 77,
        userId: 2,
        projectSlug: "rs23",
      }),
    )
  })

  test("allows viewer project-record uploads with an empty summary", async () => {
    const { createUpload } = await import("./uploads.server")
    mockDb.projectRecord.findMany.mockResolvedValue([{ id: 42 }])

    await createUpload(headers, {
      ...baseInput,
      surveyResponseId: null,
      projectRecords: [42],
    })

    expect(mockDb.projectRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: [42] },
          project: { slug: "rs23" },
          OR: [{ reviewState: ProjectRecordReviewState.APPROVED }],
        }),
      }),
    )
    expect(mockDb.upload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 1,
          surveyResponseId: null,
          projectRecords: { connect: [{ id: 42 }] },
        }),
      }),
    )
  })

  test("rejects viewer uploads bound to more than one project record", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, {
        ...baseInput,
        surveyResponseId: null,
        projectRecords: [42, 99],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("rejects viewer project-record uploads when the record is not visible", async () => {
    const { createUpload } = await import("./uploads.server")
    mockDb.projectRecord.findMany.mockResolvedValue([])

    await expect(
      createUpload(headers, {
        ...baseInput,
        surveyResponseId: null,
        projectRecords: [42],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("allows viewers to upload an unattached document for a new project record", async () => {
    const { createUpload } = await import("./uploads.server")

    await createUpload(headers, {
      ...baseInput,
      surveyResponseId: null,
      projectRecords: [],
    })

    expect(mockDb.upload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 1,
          surveyResponseId: null,
          projectRecords: { connect: [] },
        }),
      }),
    )
  })

  test("rejects unattached viewer uploads that set other relations", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, {
        ...baseInput,
        surveyResponseId: null,
        projectRecords: [],
        subsubsections: [5],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("rejects viewer uploads that would share the document externally", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, {
        ...baseInput,
        surveyResponseId: null,
        projectRecords: [],
        externalShareEnabled: true,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("includes Maßnahme and Protokolleintrag in the CREATE log message", async () => {
    const { createUpload } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.subsubsection.findMany.mockResolvedValue([{ id: 5 }])
    mockDb.projectRecord.findMany.mockResolvedValue([{ id: 42 }])
    mockDb.upload.create.mockResolvedValue({
      id: 77,
      title: "Foto.jpg",
      subsubsections: [{ slug: "rf1" }],
      projectRecords: [{ title: "Ortstermin" }],
      acquisitionAreas: [],
    })

    await createUpload(headers, {
      ...baseInput,
      title: "Foto.jpg",
      surveyResponseId: null,
      subsubsections: [5],
      projectRecords: [42],
    })

    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        message:
          "Neues Dokument »Foto.jpg« zur Maßnahme »RF1« und zum Protokolleintrag »Ortstermin« wurde hinzugefügt.",
        uploadId: 77,
      }),
    )
  })

  test("rejects viewer project-record uploads that also set extra relations", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, {
        ...baseInput,
        surveyResponseId: null,
        projectRecords: [42],
        tags: [9],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

  test("keeps externalUrl immutable when editors update upload metadata", async () => {
    const { updateUpload } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })

    await updateUpload(headers, {
      ...baseInput,
      id: 77,
      title: "Renamed document.pdf",
      externalUrl: "https://example.com/legacy-document.pdf",
    })

    expect(mockDb.upload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 77 },
        data: expect.not.objectContaining({
          externalUrl: expect.any(String),
        }),
      }),
    )
  })

  test("returns existing upload metadata for filename collisions", async () => {
    const { checkUploadFilenameCollisions } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.upload.findMany.mockResolvedValueOnce([
      {
        id: 77,
        externalUrl: projectExternalUrl,
        title: "Dokumenttitel",
      },
    ])

    const result = await checkUploadFilenameCollisions(headers, {
      projectSlug: "rs23",
      filenames: ["document.pdf"],
    })

    expect(result).toEqual({
      collisions: [
        {
          filename: "document.pdf",
          existingUpload: {
            id: 77,
            filename: "document.pdf",
            title: "Dokumenttitel",
          },
        },
      ],
    })
    // Compares project-wide, but never against a participant's own survey upload
    expect(mockDb.upload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { project: { slug: "rs23" }, surveyResponseId: null },
      }),
    )
  })

  test("refuses to replace the file of a survey upload", async () => {
    const { replaceUploadFile } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.upload.findFirstOrThrow.mockRejectedValueOnce(new Error("No Upload found"))

    await expect(
      replaceUploadFile(headers, {
        id: 77,
        projectSlug: "rs23",
        externalUrl: replacementExternalUrl,
      }),
    ).rejects.toThrow()
    expect(mockDb.upload.findFirstOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ surveyResponseId: null }),
      }),
    )
    expect(mockDb.upload.update).not.toHaveBeenCalled()
  })

  test("replaces the stored file without overwriting the existing title", async () => {
    const { replaceUploadFile } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.upload.findFirstOrThrow.mockResolvedValueOnce({
      id: 77,
      collaborationPath: null,
      collaborationUrl: null,
      externalUrl: projectExternalUrl,
    })
    mockDb.upload.update.mockResolvedValueOnce({ id: 77, externalUrl: replacementExternalUrl })

    await replaceUploadFile(headers, {
      id: 77,
      projectSlug: "rs23",
      externalUrl: replacementExternalUrl,
      mimeType: "application/pdf",
      fileSize: 4321,
    })

    expect(mockDb.upload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 77 },
        data: expect.objectContaining({
          externalUrl: replacementExternalUrl,
          fileSize: 4321,
          summary: null,
          updatedById: 2,
        }),
      }),
    )
    expect(mockDb.upload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({
          title: expect.any(String),
        }),
      }),
    )
    expect(mockDeleteObject).toHaveBeenCalledWith(
      mockS3Client,
      expect.objectContaining({
        key: "upload-localdev/rs23/uuid/document.pdf",
      }),
    )
  })

  test("keeps the stored file when the replacement points at the same object", async () => {
    const { replaceUploadFile } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })
    mockDb.upload.findFirstOrThrow.mockResolvedValueOnce({
      id: 77,
      collaborationPath: null,
      collaborationUrl: null,
      externalUrl: projectExternalUrl,
    })
    mockDb.upload.update.mockResolvedValueOnce({ id: 77, externalUrl: projectExternalUrl })

    await replaceUploadFile(headers, {
      id: 77,
      projectSlug: "rs23",
      externalUrl: projectExternalUrl,
    })

    expect(mockDeleteObject).not.toHaveBeenCalled()
  })

  test("rejects a replacement file stored outside the project prefix", async () => {
    const { replaceUploadFile } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockResolvedValueOnce({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: 2, role: "USER" },
    })

    await expect(
      replaceUploadFile(headers, {
        id: 77,
        projectSlug: "rs23",
        externalUrl: otherProjectExternalUrl,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError)
    expect(mockDb.upload.update).not.toHaveBeenCalled()
  })
})

describe("deleteUploadIfOrphan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: "7", role: "USER" },
    })
  })

  test("keeps an externally shared document that has no links", async () => {
    mockDb.upload.findFirstOrThrow.mockResolvedValue({
      id: 42,
      title: "Lageplan.pdf",
      createdById: 7,
      collaborationPath: null,
      collaborationUrl: null,
      externalUrl: projectExternalUrl,
      projectRecordEmailId: null,
      surveyResponseId: null,
      externalShareEnabled: true,
      _count: { projectRecords: 0, subsubsections: 0, acquisitionAreas: 0, tags: 0 },
    })
    const { deleteUploadIfOrphan } = await import("./uploads.server")

    await expect(deleteUploadIfOrphan(headers, { projectSlug: "rs23", id: 42 })).resolves.toEqual({
      deleted: false,
    })
    expect(mockDeleteObject).not.toHaveBeenCalled()
  })
})

describe("getUploadsWithSubsections", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "VIEWER",
      session: { userId: "7", role: "USER" },
    })
    mockDb.upload.findMany.mockResolvedValue([])
    mockDb.upload.count.mockResolvedValue(0)
    mockDb.membership.findMany.mockResolvedValue([])
  })

  test("drops a client-built Prisma filter, so other projects stay out of reach", async () => {
    const { getUploadsWithSubsections } = await import("./uploads.server")
    const input = GetUploadsWithSubsectionsSchema.parse({
      projectSlug: "rs23",
      where: { project: { slug: "other-project", externalShareToken: { startsWith: "a" } } },
    })

    await getUploadsWithSubsections(headers, input)

    const where = mockDb.upload.findMany.mock.calls[0]?.[0]?.where
    expect(where?.project).toEqual({ slug: "rs23" })
    expect(JSON.stringify(where)).not.toContain("externalShareToken")
  })

  test("turns each fixed filter into a relation filter inside the project", async () => {
    const { getUploadsWithSubsections } = await import("./uploads.server")

    await getUploadsWithSubsections(headers, {
      projectSlug: "rs23",
      subsubsectionId: 5,
      acquisitionAreaId: 8,
      uploadIds: [10, 11],
    })

    expect(mockDb.upload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { slug: "rs23" },
          subsubsections: { some: { id: 5 } },
          acquisitionAreas: { some: { id: 8 } },
          id: { in: [10, 11] },
        }),
      }),
    )
  })
})

describe("updateUpload", () => {
  const previousUpload = {
    id: 77,
    title: "document.pdf",
    externalShareEnabled: false,
    projectRecords: [],
    subsubsections: [],
    acquisitionAreas: [],
    tags: [],
  }
  const input = { ...baseInput, id: 77, surveyResponseId: null, externalShareEnabled: true }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEndpointAuth.projectRole.mockResolvedValue({
      projectId: 1,
      membershipRole: "EDITOR",
      session: { userId: "7", role: "USER" },
    })
    mockDb.upload.findFirstOrThrow.mockResolvedValue(previousUpload)
    mockDb.upload.update.mockResolvedValue({ ...previousUpload, externalShareEnabled: true })
    mockDb.membership.findMany.mockResolvedValue([])
  })

  test("refuses viewers, so they can't share a document through the edit form", async () => {
    const { updateUpload } = await import("./uploads.server")
    mockEndpointAuth.projectRole.mockImplementation(async (_headers, _slug, roles: string[]) => {
      if (!roles.includes("VIEWER")) throw new AuthorizationError()
    })

    await expect(updateUpload(headers, input)).rejects.toBeInstanceOf(AuthorizationError)
    expect(mockDb.upload.update).not.toHaveBeenCalled()
  })

  test("saves and logs a change of the external share flag", async () => {
    const { updateUpload } = await import("./uploads.server")

    await updateUpload(headers, input)

    expect(mockDb.upload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ externalShareEnabled: true }) }),
    )
    expect(mockCreateLogEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        previousRecord: expect.objectContaining({ externalShareEnabled: false }),
        updatedRecord: expect.objectContaining({ externalShareEnabled: true }),
      }),
    )
  })
})
