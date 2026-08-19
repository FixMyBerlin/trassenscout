import { describe, expect, test } from "vitest"
import { createUploadFilenameAllocator } from "./uploadFilenameAllocation"

const upload = (filename: string, title = filename, id = 1) => ({
  id,
  title,
  externalUrl: `https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/rs1/uuid-${id}/${filename}`,
})

const allocate = (
  filenames: string[],
  existing: ReturnType<typeof upload>[],
  replacementTargets: ReturnType<typeof upload>[] = [],
) => {
  const claim = createUploadFilenameAllocator({ filenames, existing, replacementTargets })
  return filenames.map(claim)
}

describe("createUploadFilenameAllocator", () => {
  test("dedupes against the filenames the project already stores", () => {
    expect(allocate(["foto.png"], [upload("foto.png")])).toEqual([
      { filename: "foto(1).png", replacesUploadId: null },
    ])
  })

  test("a confirmed replacement keeps the filename and names the record it takes over", () => {
    const existing = [upload("foto.png", "foto.png", 12)]
    expect(allocate(["foto.png"], existing, existing)).toEqual([
      { filename: "foto.png", replacesUploadId: 12 },
    ])
  })

  test("matches through sanitization and case", () => {
    const existing = [upload("mein-foto.png", "mein-foto.png", 12)]
    expect(allocate(["Mein Foto.png"], existing, existing)).toEqual([
      { filename: "Mein-Foto.png", replacesUploadId: 12 },
    ])
  })

  test("replaces once — a second file of the same name is added alongside", () => {
    const existing = [upload("foto.png", "foto.png", 12)]
    expect(allocate(["foto.png", "foto.png"], existing, existing)).toEqual([
      { filename: "foto.png", replacesUploadId: 12 },
      { filename: "foto(1).png", replacesUploadId: null },
    ])
  })

  test("two names that sanitize alike cannot both take over one record", () => {
    const existing = [upload("mein-foto.pdf", "mein-foto.pdf", 12)]
    expect(allocate(["Mein Foto.pdf", "Mein-Foto.pdf"], existing, existing)).toEqual([
      { filename: "Mein-Foto.pdf", replacesUploadId: 12 },
      { filename: "Mein-Foto(1).pdf", replacesUploadId: null },
    ])
  })

  test("a candidate matching one record by filename and another by title claims it once", () => {
    // Upload 12 is stored as foto.jpg but titled bericht.pdf, so both candidates match it
    const existing = [upload("foto.jpg", "bericht.pdf", 12)]
    expect(allocate(["foto.jpg", "bericht.pdf"], existing, existing)).toEqual([
      { filename: "foto.jpg", replacesUploadId: 12 },
      { filename: "bericht.pdf", replacesUploadId: null },
    ])
  })

  test("keeps deduping when only one of several uploads sharing the name is replaced", () => {
    const existing = [upload("foto.png", "foto.png", 1), upload("foto.png", "foto.png", 2)]
    expect(allocate(["foto.png"], existing, [existing[1]!])).toEqual([
      { filename: "foto(1).png", replacesUploadId: 2 },
    ])
  })

  test("leaves files that collide with nothing untouched", () => {
    expect(allocate(["plan.pdf"], [upload("foto.png")])).toEqual([
      { filename: "plan.pdf", replacesUploadId: null },
    ])
  })

  test("replaces several files in one batch, each taking over its own record", () => {
    const existing = [
      upload("plan.pdf", "plan.pdf", 1),
      upload("foto.png", "foto.png", 2),
      upload("andere.txt", "andere.txt", 3),
    ]

    expect(
      allocate(["plan.pdf", "foto.png", "neu.pdf"], existing, [existing[0]!, existing[1]!]),
    ).toEqual([
      { filename: "plan.pdf", replacesUploadId: 1 },
      { filename: "foto.png", replacesUploadId: 2 },
      { filename: "neu.pdf", replacesUploadId: null },
    ])
  })

  test("replaces only the files that were confirmed, deduping the rest", () => {
    const existing = [upload("plan.pdf", "plan.pdf", 1), upload("foto.png", "foto.png", 2)]

    // Only upload 1 was confirmed, so foto.png collides but must not take upload 2 over
    expect(allocate(["plan.pdf", "foto.png"], existing, [existing[0]!])).toEqual([
      { filename: "plan.pdf", replacesUploadId: 1 },
      { filename: "foto(1).png", replacesUploadId: null },
    ])
  })

  test("a batch of duplicates replaces once and adds the rest", () => {
    const existing = [upload("foto.png", "foto.png", 12)]

    expect(allocate(["foto.png", "foto.png", "foto.png"], existing, existing)).toEqual([
      { filename: "foto.png", replacesUploadId: 12 },
      { filename: "foto(1).png", replacesUploadId: null },
      { filename: "foto(2).png", replacesUploadId: null },
    ])
  })
})
