import { describe, expect, test } from "vitest"
import { matchSlugFromFilename, type SubsubsectionSlugPair } from "./matchSlugFromFilename"

const pair = (
  subsubsectionId: number,
  subsectionSlug: string,
  subsubsectionSlug: string,
): SubsubsectionSlugPair => ({ subsubsectionId, subsectionSlug, subsubsectionSlug })

describe("matchSlugFromFilename", () => {
  test("matches a simple filename", () => {
    const result = matchSlugFromFilename("line-3_point-1_foto.jpg", [pair(1, "line-3", "point-1")])
    expect(result).toEqual({ kind: "matched", pair: pair(1, "line-3", "point-1") })
  })

  test("matches when the prefix is the whole basename", () => {
    const result = matchSlugFromFilename("line-3_point-1.jpg", [pair(1, "line-3", "point-1")])
    expect(result.kind).toBe("matched")
  })

  test("matches a filename without extension", () => {
    const result = matchSlugFromFilename("line-3_point-1", [pair(1, "line-3", "point-1")])
    expect(result.kind).toBe("matched")
  })

  test("is case-insensitive on the filename", () => {
    const result = matchSlugFromFilename("Line-3_Point-1_Foto.JPG", [pair(1, "line-3", "point-1")])
    expect(result.kind).toBe("matched")
  })

  test("rejects a prefix without boundary char (point-1 must not match point-10)", () => {
    const result = matchSlugFromFilename("line-3_point-10_foto.jpg", [pair(1, "line-3", "point-1")])
    expect(result).toEqual({ kind: "unmatched" })
  })

  test("longest matching prefix wins (point-1 vs point-1-a)", () => {
    const pairs = [pair(1, "line-3", "point-1"), pair(2, "line-3", "point-1-a")]
    const result = matchSlugFromFilename("line-3_point-1-a_foto.jpg", pairs)
    expect(result).toEqual({ kind: "matched", pair: pairs[1] })
  })

  test("shorter pair still matches its own files when a longer sibling exists", () => {
    const pairs = [pair(1, "line-3", "point-1"), pair(2, "line-3", "point-1-a")]
    const result = matchSlugFromFilename("line-3_point-1_foto.jpg", pairs)
    expect(result).toEqual({ kind: "matched", pair: pairs[0] })
  })

  test("supports slugs containing underscores and dots", () => {
    const pairs = [pair(1, "abschnitt_1", "m.01_a")]
    const result = matchSlugFromFilename("abschnitt_1_m.01_a-foto.jpg", pairs)
    expect(result).toEqual({ kind: "matched", pair: pairs[0] })
  })

  test("returns ambiguous when two distinct pairs form the identical prefix", () => {
    const pairs = [pair(1, "a", "b_c"), pair(2, "a_b", "c")]
    const result = matchSlugFromFilename("a_b_c_foto.jpg", pairs)
    expect(result).toEqual({ kind: "ambiguous", prefix: "a_b_c" })
  })

  test("returns unmatched when nothing matches", () => {
    const result = matchSlugFromFilename("unrelated_foto.jpg", [pair(1, "line-3", "point-1")])
    expect(result).toEqual({ kind: "unmatched" })
  })

  test("returns unmatched for an empty pair list", () => {
    expect(matchSlugFromFilename("line-3_point-1_foto.jpg", [])).toEqual({ kind: "unmatched" })
  })

  test("never matches filenames with umlauts or spaces to unrelated slugs", () => {
    const result = matchSlugFromFilename("Straßen Foto 2024.jpg", [pair(1, "line-3", "point-1")])
    expect(result).toEqual({ kind: "unmatched" })
  })
})
