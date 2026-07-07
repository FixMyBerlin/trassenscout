import { describe, expect, test } from "vitest"
import { findCollidingFilenames } from "./filenameCollisions"

const existingUpload = (filename: string, title = filename) => ({
  externalUrl: `https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/rs1/uuid-123/${filename}`,
  title,
})

describe("findCollidingFilenames", () => {
  test("detects a collision with an existing S3 filename", () => {
    const result = findCollidingFilenames(["foto.jpg"], [existingUpload("foto.jpg")])
    expect(result).toEqual(["foto.jpg"])
  })

  test("detects a collision after sanitization (spaces become hyphens in S3)", () => {
    // "mein foto.jpg" was stored as "mein-foto.jpg" in S3
    const result = findCollidingFilenames(
      ["mein foto.jpg"],
      [existingUpload("mein-foto.jpg", "anderer titel")],
    )
    expect(result).toEqual(["mein foto.jpg"])
  })

  test("detects a collision with an existing title", () => {
    const result = findCollidingFilenames(
      ["urlaub.jpg"],
      [existingUpload("uuid-name.jpg", "urlaub.jpg")],
    )
    expect(result).toEqual(["urlaub.jpg"])
  })

  test("is case-insensitive", () => {
    const result = findCollidingFilenames(["FOTO.JPG"], [existingUpload("foto.jpg")])
    expect(result).toEqual(["FOTO.JPG"])
  })

  test("returns nothing when there are no collisions", () => {
    const result = findCollidingFilenames(["neu.jpg"], [existingUpload("alt.jpg")])
    expect(result).toEqual([])
  })

  test("returns nothing for an empty project", () => {
    expect(findCollidingFilenames(["foto.jpg"], [])).toEqual([])
  })

  test("only returns the colliding candidates", () => {
    const result = findCollidingFilenames(["a.jpg", "b.jpg", "c.jpg"], [existingUpload("b.jpg")])
    expect(result).toEqual(["b.jpg"])
  })
})
