import { beforeEach, describe, expect, test, vi } from "vitest"
import { NotFoundError } from "@/src/shared/auth/errors"

const mockDb = {
  project: { findFirst: vi.fn() },
  upload: { findFirst: vi.fn() },
}
const mockStreamUploadObject = vi.fn()
const mockLoadContent = vi.fn()
const mockBuildGeojson = vi.fn()

vi.mock("@/src/server/db.server", () => ({ default: mockDb }))
vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { public: vi.fn() },
}))
vi.mock("@/src/server/auth/publicEndpointRateLimit.server", () => ({
  enforcePublicEndpointRateLimit: vi.fn(),
}))
vi.mock("@/src/server/uploads/_utils/streamUploadObject.server", () => ({
  streamUploadObject: mockStreamUploadObject,
}))
vi.mock("./_utils/externalShareContent.server", () => ({
  loadExternalShareContent: mockLoadContent,
  buildExternalShareGeojson: mockBuildGeojson,
}))

const headers = new Headers()
const token = "a".repeat(43)

describe("public external share", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.project.findFirst.mockResolvedValue({ id: 1, slug: "rs23", subTitle: null })
    mockLoadContent.mockResolvedValue({ uploads: [], subsubsectionCount: 0 })
    mockBuildGeojson.mockResolvedValue({ type: "FeatureCollection", features: [] })
    mockStreamUploadObject.mockResolvedValue(new Response("file"))
  })

  test("rejects a malformed token without touching the database", async () => {
    const { getPublicExternalShare } = await import("./publicExternalShare.server")

    await expect(getPublicExternalShare(headers, "short")).rejects.toBeInstanceOf(NotFoundError)
    expect(mockDb.project.findFirst).not.toHaveBeenCalled()
  })

  test("only opens projects whose admin switch is on", async () => {
    const { getPublicExternalShare } = await import("./publicExternalShare.server")
    mockDb.project.findFirst.mockResolvedValue(null)

    await expect(getPublicExternalShare(headers, token)).rejects.toBeInstanceOf(NotFoundError)
    expect(mockDb.project.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { externalShareToken: token, externalShareEnabled: true },
      }),
    )
  })

  test("serves a file only when it is shared and belongs to the enabled project", async () => {
    const { serveExternalShareUpload } = await import("./publicExternalShare.server")
    mockDb.upload.findFirst.mockResolvedValue({ externalUrl: "https://s3/file.pdf" })

    await serveExternalShareUpload(headers, { token, uploadId: "7" }, { download: true })

    expect(mockDb.upload.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 7,
          externalShareEnabled: true,
          project: { externalShareToken: token, externalShareEnabled: true },
        },
      }),
    )
    expect(mockStreamUploadObject).toHaveBeenCalledWith("https://s3/file.pdf", {
      download: true,
      headers: expect.objectContaining({ "Cache-Control": "private, no-store" }),
    })
  })

  test("answers an unshared file with the same 404 as an unknown link", async () => {
    const { serveExternalShareUpload } = await import("./publicExternalShare.server")
    mockDb.upload.findFirst.mockResolvedValue(null)

    const response = await serveExternalShareUpload(headers, { token, uploadId: "7" })

    expect(response.status).toBe(404)
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
    expect(mockStreamUploadObject).not.toHaveBeenCalled()
  })

  test("rejects a non-numeric upload id before querying", async () => {
    const { serveExternalShareUpload } = await import("./publicExternalShare.server")

    const response = await serveExternalShareUpload(headers, { token, uploadId: "abc" })

    expect(response.status).toBe(404)
    expect(mockDb.upload.findFirst).not.toHaveBeenCalled()
  })

  test("delivers the Maßnahmen as a GeoJSON download", async () => {
    const { serveExternalShareGeojson } = await import("./publicExternalShare.server")

    const response = await serveExternalShareGeojson(headers, { token })

    expect(response.headers.get("Content-Type")).toContain("application/geo+json")
    expect(response.headers.get("Content-Disposition")).toMatch(
      /^attachment; filename="rs23_Massnahmen_\d{4}-\d{2}-\d{2}\.geojson"$/,
    )
    expect(await response.json()).toEqual({ type: "FeatureCollection", features: [] })
  })

  test("answers an unknown link on the GeoJSON route with a 404", async () => {
    const { serveExternalShareGeojson } = await import("./publicExternalShare.server")
    mockDb.project.findFirst.mockResolvedValue(null)

    const response = await serveExternalShareGeojson(headers, { token })

    expect(response.status).toBe(404)
    expect(mockBuildGeojson).not.toHaveBeenCalled()
  })
})
