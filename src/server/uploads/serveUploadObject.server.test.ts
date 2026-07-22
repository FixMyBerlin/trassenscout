import { getObject } from "@better-upload/server/helpers"
import { beforeEach, describe, expect, test, vi } from "vitest"

const mockDb = {
  upload: {
    findFirst: vi.fn(),
  },
}

const mockEndpointAuth = {
  projectMember: vi.fn(),
}

const mockGetProjectIdBySlug = vi.fn()
const mockGetConfiguredS3Client = vi.fn()

vi.mock("@/src/server/db.server", () => ({
  default: mockDb,
}))

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: mockEndpointAuth,
}))

vi.mock("@/src/server/projects/queries/getProjectIdBySlug.server", () => ({
  getProjectIdBySlug: mockGetProjectIdBySlug,
}))

vi.mock("@/src/server/uploads/_utils/s3Client.server", () => ({
  getConfiguredS3Client: mockGetConfiguredS3Client,
}))

vi.mock("@/src/components/core/utils/isEnv", () => ({
  isPlaywright: false,
}))

vi.mock("@better-upload/server/helpers", () => ({
  getObject: vi.fn(),
}))

describe("serveProjectUploadObject", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.S3_UPLOAD_ROOTFOLDER = "upload-localdev"
    mockEndpointAuth.projectMember.mockResolvedValue({ userId: 2, role: "USER" })
    mockGetProjectIdBySlug.mockResolvedValue(1)
    mockGetConfiguredS3Client.mockReturnValue({ client: "s3" })
    vi.mocked(getObject).mockResolvedValue({
      blob: new Blob(["legacy file"]),
      contentType: "application/pdf",
      contentLength: 11,
      eTag: "etag",
    } as Awaited<ReturnType<typeof getObject>>)
  })

  test("streams the project-scoped upload without revalidating legacy URL shape", async () => {
    const { serveProjectUploadObject } = await import("./serveUploadObject.server")
    mockDb.upload.findFirst.mockResolvedValue({
      externalUrl: "https://example.com/legacy-document.pdf",
    })

    const response = await serveProjectUploadObject(new Headers(), {
      projectSlug: "rs23",
      uploadId: "99",
    })

    expect(response.status).toBe(200)
    expect(getObject).toHaveBeenCalledWith(
      { client: "s3" },
      { bucket: "trassenscout", key: "legacy-document.pdf" },
    )
  })
})
