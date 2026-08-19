import { describe, expect, test } from "vitest"
import { findFilenameCollisions } from "./filenameCollisions"

const collidingFilenames = (
  candidates: string[],
  existing: { externalUrl: string; title: string }[],
) => findFilenameCollisions(candidates, existing).map((collision) => collision.filename)

const existingUpload = (filename: string, title = filename) => ({
  externalUrl: `https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/rs1/uuid-123/${filename}`,
  title,
})

describe("findFilenameCollisions", () => {
  test("detects a collision with an existing S3 filename", () => {
    const result = collidingFilenames(["foto.jpg"], [existingUpload("foto.jpg")])
    expect(result).toEqual(["foto.jpg"])
  })

  test("detects a collision after sanitization (spaces become hyphens in S3)", () => {
    // "mein foto.jpg" was stored as "mein-foto.jpg" in S3
    const result = collidingFilenames(
      ["mein foto.jpg"],
      [existingUpload("mein-foto.jpg", "anderer titel")],
    )
    expect(result).toEqual(["mein foto.jpg"])
  })

  test("detects a collision with an existing title", () => {
    const result = collidingFilenames(
      ["urlaub.jpg"],
      [existingUpload("uuid-name.jpg", "urlaub.jpg")],
    )
    expect(result).toEqual(["urlaub.jpg"])
  })

  test("is case-insensitive", () => {
    const result = collidingFilenames(["FOTO.JPG"], [existingUpload("foto.jpg")])
    expect(result).toEqual(["FOTO.JPG"])
  })

  test("returns nothing when there are no collisions", () => {
    const result = collidingFilenames(["neu.jpg"], [existingUpload("alt.jpg")])
    expect(result).toEqual([])
  })

  test("returns nothing for an empty project", () => {
    expect(collidingFilenames(["foto.jpg"], [])).toEqual([])
  })

  test("only returns the colliding candidates", () => {
    const result = collidingFilenames(["a.jpg", "b.jpg", "c.jpg"], [existingUpload("b.jpg")])
    expect(result).toEqual(["b.jpg"])
  })

  test("returns the existing upload for replacement", () => {
    const result = findFilenameCollisions(
      ["foto.jpg"],
      [{ id: 12, ...existingUpload("foto.jpg", "Foto") }],
    )

    expect(result).toEqual([
      {
        filename: "foto.jpg",
        existingUpload: {
          id: 12,
          filename: "foto.jpg",
          externalUrl:
            "https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/rs1/uuid-123/foto.jpg",
          title: "Foto",
        },
      },
    ])
  })

  test("prefers the stored filename over an editable title match", () => {
    const result = findFilenameCollisions(
      ["foto.jpg"],
      [
        { id: 1, ...existingUpload("anderer-dateiname.jpg", "foto.jpg") },
        { id: 2, ...existingUpload("foto.jpg", "Anderer Titel") },
      ],
    )

    expect(result[0]?.existingUpload.id).toBe(2)
  })
})
