import { beforeEach, describe, expect, test, vi } from "vitest"
import { AuthorizationError } from "@/src/shared/auth/errors"

const mockDb = {
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

const projectExternalUrl =
  "https://trassenscout.s3.eu-central-1.amazonaws.com/upload-localdev/rs23/uuid/document.pdf"
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
    mockDb.upload.findFirstOrThrow.mockResolvedValue({ id: 77 })
    mockDb.upload.create.mockResolvedValue({ id: 77 })
    mockDb.upload.update.mockResolvedValue({ id: 77 })
  })

  test("rejects viewer upload records with S3 keys outside the project prefix", async () => {
    const { createUpload } = await import("./uploads.server")

    await expect(
      createUpload(headers, { ...baseInput, externalUrl: otherProjectExternalUrl }),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(mockDb.surveyResponse.findFirstOrThrow).not.toHaveBeenCalled()
    expect(mockDb.upload.create).not.toHaveBeenCalled()
  })

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
})
