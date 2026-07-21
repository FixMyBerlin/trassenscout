import { describe, expect, test } from "vitest"
import { dedupeUploadFilename } from "./dedupeUploadFilename"

describe("dedupeUploadFilename", () => {
  test("returns the sanitized name unchanged when there is no collision", () => {
    expect(dedupeUploadFilename("foto.png", new Set())).toBe("foto.png")
    expect(dedupeUploadFilename("foto.png", new Set(["andere.png"]))).toBe("foto.png")
  })

  test("appends (1) before the extension on the first collision", () => {
    expect(dedupeUploadFilename("foto.png", new Set(["foto.png"]))).toBe("foto(1).png")
  })

  test("increments to the next free suffix", () => {
    expect(dedupeUploadFilename("foto.png", new Set(["foto.png", "foto(1).png"]))).toBe(
      "foto(2).png",
    )
  })

  test("is case-insensitive when detecting collisions", () => {
    expect(dedupeUploadFilename("Foto.PNG", new Set(["foto.png"]))).toBe("Foto(1).PNG")
  })

  test("sanitizes the incoming filename (spaces become dashes)", () => {
    expect(dedupeUploadFilename("my foto.png", new Set())).toBe("my-foto.png")
  })

  test("dedupes a whole batch via the shared set (in-batch duplicates)", () => {
    const taken = new Set<string>()
    expect(dedupeUploadFilename("foto.png", taken)).toBe("foto.png")
    expect(dedupeUploadFilename("foto.png", taken)).toBe("foto(1).png")
    expect(dedupeUploadFilename("foto.png", taken)).toBe("foto(2).png")
  })

  test("produces an S3-safe suffix (parentheses survive, no spaces introduced)", () => {
    const result = dedupeUploadFilename("foto.png", new Set(["foto.png"]))
    expect(result).toBe("foto(1).png")
    expect(result).not.toMatch(/\s/)
  })

  test("only splits on the last extension", () => {
    expect(dedupeUploadFilename("archiv.tar.gz", new Set(["archiv.tar.gz"]))).toBe(
      "archiv.tar(1).gz",
    )
  })

  test("handles filenames without an extension (taken set is lowercased by contract)", () => {
    expect(dedupeUploadFilename("README", new Set(["readme"]))).toBe("README(1)")
  })
})
