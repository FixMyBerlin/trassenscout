import { getObjectBlob, getObjectStream } from "@better-upload/server/helpers"
import { beforeEach, describe, expect, test, vi } from "vitest"

vi.mock("@better-upload/server/helpers", () => ({
  getObjectBlob: vi.fn(),
  getObjectStream: vi.fn(),
}))
vi.mock("./s3Client.server", () => ({ getConfiguredS3Client: () => ({ client: "s3" }) }))

const resetError = Object.assign(new Error("The socket connection was closed unexpectedly."), {
  code: "ECONNRESET",
})
const object = { blob: new Blob(["file"]) } as Awaited<ReturnType<typeof getObjectBlob>>
const streamed = { stream: new Blob(["file"]).stream() } as Awaited<
  ReturnType<typeof getObjectStream>
>

describe("getS3Object", () => {
  beforeEach(() => {
    vi.mocked(getObjectBlob).mockReset()
    vi.mocked(getObjectStream).mockReset()
  })

  test("retries once when S3 dropped a pooled keep-alive socket", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObjectBlob).mockRejectedValueOnce(resetError).mockResolvedValueOnce(object)

    await expect(getS3Object("key")).resolves.toBe(object)
    expect(getObjectBlob).toHaveBeenCalledTimes(2)
  })

  test("does not retry other errors", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObjectBlob).mockRejectedValueOnce(new Error("Access Denied"))

    await expect(getS3Object("key")).rejects.toThrow("Access Denied")
    expect(getObjectBlob).toHaveBeenCalledTimes(1)
  })

  test("gives up after the single retry", async () => {
    const { getS3Object } = await import("./getS3Object.server")
    vi.mocked(getObjectBlob).mockRejectedValue(resetError)

    await expect(getS3Object("key")).rejects.toBe(resetError)
    expect(getObjectBlob).toHaveBeenCalledTimes(2)
  })

  test("streams without buffering and retries a dropped socket the same way", async () => {
    const { getS3ObjectStream } = await import("./getS3Object.server")
    vi.mocked(getObjectStream).mockRejectedValueOnce(resetError).mockResolvedValueOnce(streamed)

    await expect(getS3ObjectStream("key")).resolves.toBe(streamed)
    expect(getObjectStream).toHaveBeenCalledTimes(2)
    expect(getObjectBlob).not.toHaveBeenCalled()
  })
})
