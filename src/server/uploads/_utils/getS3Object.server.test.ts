import { getObject } from "@better-upload/server/helpers"
import { beforeEach, describe, expect, test, vi } from "vitest"

vi.mock("@better-upload/server/helpers", () => ({ getObject: vi.fn() }))
vi.mock("./s3Client.server", () => ({ getConfiguredS3Client: () => ({ client: "s3" }) }))

const resetError = Object.assign(new Error("The socket connection was closed unexpectedly."), {
  code: "ECONNRESET",
})
const object = { blob: new Blob(["file"]) } as Awaited<ReturnType<typeof getObject>>

describe("getS3Object", () => {
  beforeEach(() => {
    vi.mocked(getObject).mockReset()
  })

  test("retries once when S3 dropped a pooled keep-alive socket", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObject).mockRejectedValueOnce(resetError).mockResolvedValueOnce(object)

    await expect(getS3Object("key")).resolves.toBe(object)
    expect(getObject).toHaveBeenCalledTimes(2)
  })

  test("does not retry other errors", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObject).mockRejectedValueOnce(new Error("Access Denied"))

    await expect(getS3Object("key")).rejects.toThrow("Access Denied")
    expect(getObject).toHaveBeenCalledTimes(1)
  })

  test("gives up after the single retry", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObject).mockRejectedValue(resetError)

    await expect(getS3Object("key")).rejects.toBe(resetError)
    expect(getObject).toHaveBeenCalledTimes(2)
  })
})
