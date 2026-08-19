import { describe, expect, test } from "vitest"
import type { UploadFilenameConflict } from "./uploadFilenameConflicts"
import { oneConflictPerUpload } from "./uploadFilenameConflicts"

const conflict = (filename: string, id: number, title = filename): UploadFilenameConflict => ({
  filename,
  existingUpload: { id, title, filename },
})

describe("oneConflictPerUpload", () => {
  test("keeps one entry per existing upload", () => {
    const result = oneConflictPerUpload([conflict("foto.jpg", 1), conflict("plan.pdf", 2)])
    expect(result.map((collision) => collision.filename)).toEqual(["foto.jpg", "plan.pdf"])
  })

  test("offers an upload once even when two picked names match it", () => {
    // "Mein Foto.pdf" matches upload 12 by its stored name, "bericht.pdf" by its title
    const result = oneConflictPerUpload([
      conflict("Mein Foto.pdf", 12),
      conflict("bericht.pdf", 12),
    ])
    expect(result.map((collision) => collision.filename)).toEqual(["Mein Foto.pdf"])
  })
})
